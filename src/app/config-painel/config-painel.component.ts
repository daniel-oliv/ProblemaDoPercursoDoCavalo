import { Component, OnInit, ɵConsole } from "@angular/core";
import {Tile} from '../model/tile';
import {Board} from '../model/board';

@Component({
  selector: "app-config-painel",
  templateUrl: "./config-painel.component.html",
  styleUrls: ["./config-painel.component.css"]
})
export class ConfigPainelComponent implements OnInit {
  probMutacao: number;
  probCruzamento: number;
  //resolution: number;
  populationSize: number;
  //intervalMax: number;
  //intervalMin: number;
  //minFunctionInTheInterval: number;
  //maxFunctionInTheInterval: number;
  maxNumOfGenerations: number;
  bestInd: individual[];
  numOfBestToKeep: number;
  numCurrentGeneration: number;
  generations: any[];
  couplesSelectionMode: string;
  mutationMode: string;
  checkBoxSelectedItens: string[];
  numOfIndividualsInTourney: number;
  numOfElitismInd: number;

  graphData: any;
  functionDataSet: any;
  generationsDataSets: any[];

  colors: string[];
  color: number;
  isGraphResponsive: boolean;
  showGraph1: string;
  showGraph2: string;
  performanceData: any;
  bestIndividualData: any;

  //numOfIntervals: number;
  numOfVariables: number;
  destinations: Tile[];
  mapLineData: marker[];

  numLines: number;
  numColumns: number;
  board: Board;

  constructor() {
    
  }

  ngOnInit() 
  {
    console.log("ngOnInit");
    

    this.probCruzamento = 0.01;
    this.probMutacao = 0.90;
    this.populationSize = 100;
    this.maxNumOfGenerations = 80;
    this.bestInd = [];
    this.numOfBestToKeep = 5;
    this.numCurrentGeneration = 0;
    this.generations = [];
    this.isGraphResponsive = true;
    this.showGraph1 = 'block';
    this.showGraph2 = 'none';
    this.couplesSelectionMode = "Torneio";
    this.mutationMode = "Individuo";
    this.checkBoxSelectedItens = ["elitism"];
    this.numOfIndividualsInTourney = 50;
    this.numOfElitismInd = 50;

    this.numLines = 8;
    this.numColumns = 8;
    this.newBoard();

  }

  newBoard(event = null)
  {
    //console.log("newBoard");
    this.board = new Board(this.numLines, this.numColumns);
    this.destinations = this.board.tiles;
    //console.log("destinations ", destinations);
    //console.log("this ", this.destinations);
    this.numOfVariables = this.destinations.length;
    //console.log("board", this.board);
  }

  numOfNewIndividual() 
  {
    let numOfNewIndividual: number;

    if (this.checkBoxSelectedItens.indexOf("elitism") >= 0) 
    {
      numOfNewIndividual = this.populationSize - this.numOfElitismInd;
    } 
    else
    {
      numOfNewIndividual = this.populationSize;
    }

    return numOfNewIndividual;
  }

  sumArray(array): number
  {
    let sum = 0;
    for (const iterator of array) {
      sum += iterator
    }
    return sum;
  }

  minArray(arr: number[]) 
  {
    let minValue = arr[0];
    for (let index = 1; index < arr.length; index++) 
    {
      ///se o minValue é mario que o elemento do array, então ele não o menor e deve ser trocado
      if (minValue > arr[index]) minValue = arr[index];
    }
    return minValue;
  }

  maxArray(arr: number[]) 
  {
    let maxValue = arr[0];
    for (let index = 1; index < arr.length; index++) {
      if (maxValue < arr[index]) maxValue = arr[index];
    }
    return maxValue;
  }

  getColorStr() 
  {
    return (
      "#" +
      this.color
        .toString(16)
        .toLocaleUpperCase()
        .padStart(6, "0")
    );
  }


  plotPerformanceGraph(generations: individual[][]) 
  {
    ///filling a vector with the generation numbers
    //console.log("plotPerformanceGraph");
    let xValues = [];
    for (let i = 0; i <= this.maxNumOfGenerations; i++) {
      xValues.push(i);
    }
    //console.log("xValues");
    //console.log(xValues);
    ///filling data (y values - best individuals fitness and average for every generation)
    let datasets: any[] = [];
    let bestIndividualFitnessDataset = {
      label: "Best individual",
      data: generations.map(element => {
        return this.bestIndividualFromAscendingPop(element).fitness;
      }),
      backgroundColor: undefined,
      borderColor: "#000000",
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 2
      //showLine: false // no line shown
    };
    //console.log("generations");
    /* console.log(
      generations.map(element => {
        return this.bestIndividualFromAscendingPop(element).fitness;
      })
    ); */

    let averageFitnessDataset = {
      label: "Average fitness",
      data: generations.map(element => {
        return this.calcFitnessAverage(element);
      }),
      backgroundColor: "#eeeeff",
      borderColor: "#0000ff",
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: true
      // showLine: false // no line shown
    };

    ///adding to the datasets graph
    datasets.push(bestIndividualFitnessDataset);
    datasets.push(averageFitnessDataset);

    ///updating the variable that were binded to the performance graph data
    this.performanceData = {
      animationEnabled: false, //change to false
      labels: xValues,
      datasets
    };

    this.bestIndividualData = {
      animationEnabled: false, //change to false
      labels: xValues,
      datasets: [bestIndividualFitnessDataset]
    };
  }

  /////////////////////

  optimize() 
  {
    console.log("optimize");

    ///restarting the variables

    this.generations = [];

    /// melhores indivíduos para a tabela
    this.bestInd = [];

    /// número da geração atual
    this.numCurrentGeneration = 0;

    let initialPopulation = this.selectInitialPopulation();

    ///getting a list starting with the worst individual
    let currentGeneration = this.getAscendingFitnessPopulation(initialPopulation);

    this.generations.push(currentGeneration);

    /// operations that we do for every generation
    while (this.generations.length <= this.maxNumOfGenerations) 
    {
      this.numCurrentGeneration++;

      ///this is not need since we are ordering in the end of the "for"
      //currentGeneration = this.getAscendingFitnessPopulation(currentGeneration);

      //console.log(currentGeneration);
      let nextGeneration: individual[] = [];
      let individualsToKeep: individual[] = [];

      /// if elitism is enable
      if (this.checkBoxSelectedItens.indexOf("elitism") >= 0) 
      {
        individualsToKeep = this.bestIndividualsFromAscendingPop(currentGeneration, this.numOfElitismInd);
      }

      this.applyCrossover(currentGeneration, nextGeneration);

      ///console here will show the final next population, since chrome update the objects in console
      this.applyMutation(nextGeneration);

      //console.log(nextGeneration);

      ///concating the best individuals that were kept
      nextGeneration = nextGeneration.concat(individualsToKeep);

      ///for keeping ordered lists
      nextGeneration = this.getAscendingFitnessPopulation(nextGeneration);

      this.generations.push(nextGeneration);
      currentGeneration = nextGeneration;
    }///while

    /*
    for (let i = 0; i < this.generations.length; i++) 
    {
      setTimeout(() => {
        //this.drawFunction(this.generationsDataSets.slice(i, i + 1));
      }, i * 2);
    }
    */
    this.plotPerformanceGraph(this.generations);
    //console.log(this.generations);
  }

  getAscendingFitnessPopulation(population: individual[]): individual[] {
    //console.log("original")
    //console.log(population)
    let ordered: individual[] = [];
    ordered.push(population[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < population.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        //console.log("j" + ordered[j].fitness);
        ///if the fitness is less than some already inserted individual's fitness, insert it before
        if (population[i].fitness < ordered[j].fitness) 
        {
          ordered.splice(j, 0, population[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the biggest value
      if (insertedIndividual === false) 
      {
        ordered.push(population[i]);
      }
    }
    /*console.log("getAscendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  calcSumFits(population: individual[]): number 
  {
    let sumFits = 0;
    for (let ind of population) 
    {
      sumFits += ind.fitness;
    }
    //console.log("sumFits: " + sumFits);
    return sumFits;
  }

  calcPIs(population: individual[], fitSum: number): number[] {
    /*let pis:number[] = [];
    for(let ind of population){
      pis.push(ind.fitness/fitSum);
    }*/
    let pis = population.map(ind => {
      return ind.fitness / fitSum;
    });
    //console.log("calcSumPIs: " + pis);
    return pis;
  }

  calcCumulativeProb(probs: number[]): number[] {
    let cis: number[] = [];
    let ci = 0;
    for (let i = 0; i < probs.length; i++) 
    {
      ci += probs[i];
      cis.push(ci);
    }
    //console.log("calcCumulativeProb cis.length: " + cis.length);
    //console.log("calcCumulativeProb last ci: " + cis[cis.length-1]);
    return cis;
  }

  selectByRoulette(generation: individual[]): individual[] {
    let couples: individual[] = [];
    let sumFits: number = this.calcSumFits(generation);
    let pi = this.calcPIs(generation, sumFits);
    let ci = this.calcCumulativeProb(pi);
    while (couples.length < this.numOfNewIndividual()) 
    {
      let randomNumber = Math.random();
      let selectedIndex = 0;
      while (randomNumber > ci[selectedIndex]) 
      {
        selectedIndex++;
      }
      //console.log("selectByRoulette " + "randomNumber[" + randomNumber + "]" + " selectedIndex[" + selectedIndex + "]"+ " ci[" + ci[selectedIndex] + "]");
      couples.push(generation[selectedIndex]);
    }

    return couples;
  }

  selectByTourney(generation: individual[]): individual[] 
  {
    let couples: individual[] = [];

    while (couples.length < this.numOfNewIndividual()) 
    {
      ///select individual by random
      let tourneyIndividuals = [];
      for (let index = 0; index < this.numOfIndividualsInTourney; index++) 
      {
        let randomIndex = Math.floor(Math.random() * this.populationSize);
        //if(teste < 0 && this.numCurrentGeneration < 2) console.log("selectByTourney randomIndex: " +randomIndex);
        tourneyIndividuals.push(generation[randomIndex]);
      }

      ///ordering
      tourneyIndividuals = this.getAscendingFitnessPopulation(tourneyIndividuals);

      ///select the best in the group
      couples.push(this.bestIndividualFromAscendingPop(tourneyIndividuals));
    }

    return couples;
  }

  bestIndividualFromAscendingPop(ascendingPopulation: individual[]) 
  {
    return ascendingPopulation[ascendingPopulation.length - 1];
  }

  bestIndividualsFromAscendingPop(ascendingPopulation: individual[], numOfIndividuals) 
  {
    return ascendingPopulation.slice(ascendingPopulation.length - numOfIndividuals, ascendingPopulation.length);
  }

  selectCouples(generation: individual[]) 
  {
    switch (this.couplesSelectionMode) 
    {
      case "Roleta":
        //console.log("selectCouples roleta");
        return this.selectByRoulette(generation);
        break;
      case "Torneio":
        //console.log("selectCouples torneio");
        return this.selectByTourney(generation);
        break;
      default:
        //console.log("selectCouples default");
        return null;
        break;
    }
  }

  applyCrossover(previousGeneration: individual[], nextGeneration: individual[]) 
  {
    //console.log("applyCrossover");
    let couples = this.selectCouples(previousGeneration);

    /// for every group of two individuals try to cross
    for (let index = 0; index < couples.length; index += 2) 
    {
      let couple: individual[] = couples.slice(index, index + 2);
      //console.log("couple");

      if (Math.random() < this.probCruzamento) 
      {
        ///cruza
        //console.log("can crossover");
        let newIndividuals: individual[] = this.crossIndividuals(couple);
        nextGeneration.push(newIndividuals[0]);
        nextGeneration.push(newIndividuals[1]);
        //console.log(nextGeneration);
      } 
      else 
      {
        ///keep with parents
        nextGeneration.push(couple[0]);
        nextGeneration.push(couple[1]);
      }
    }
  }

  crossIndividuals(couple: individual[]): individual[] 
  {
    //console.log("crossIndividuals couple: ", couple);
    let newIndividuals: individual[] = this.applyPMXCrossover(couple);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
  }

  //partially matched crossover
  applyPMXCrossover(couple: individual[]): individual[]
  {
    let newIndividuals: individual[] = [];
    let newChromosome: Tile[] = [];
    let indexesToCross: number[] = [];

    ///Math.floor(Math.random()*(this.resolution - 1)) 0 to 8 - +=1 1 to 9
    indexesToCross.push( this.getRandomCrossPosition() );
    indexesToCross.push( this.getRandomCrossPosition() );
    indexesToCross = this.getAscendingArray(indexesToCross);
    //console.log("applyPMXCrossover indexesToCross: ", indexesToCross);

    let blockFrom1 = couple[0].chromosome.slice(indexesToCross[0], indexesToCross[1]);
    let blockFrom2 = couple[1].chromosome.slice(indexesToCross[0], indexesToCross[1]);

    newChromosome = this.mountPMXCromosome(indexesToCross[0], indexesToCross[1], 
      couple[0].chromosome, blockFrom2, blockFrom1);
    let ind1: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind1);
    //console.log("crossIndividuals ind1: " + ind1.chromosome);

    newChromosome = this.mountPMXCromosome(indexesToCross[0], indexesToCross[1], 
      couple[1].chromosome, blockFrom1, blockFrom2);
    let ind2: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind2);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
  }

  getRandomCrossPosition(): number
  {
    return Math.floor(Math.random() * (this.numOfVariables - 1)) + 1;/// 1 to 9 (pos entre os bits)
  }

  getAscendingArray(array: number[]): number[]
  {
    let ordered: number[]= [];
    ordered.push(array[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < array.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        ///if the fitness is less than some already inserted individual's fitness, insert it before
        if (array[i] < ordered[j]) 
        {
          ordered.splice(j, 0, array[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the biggest value
      if (insertedIndividual === false) 
      {
        ordered.push(array[i]);
      }
    }
    /*console.log("getAscendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  /// the indexToCross1 must be less than indexToCross2
  mountPMXCromosome(indexToCross1: number, indexToCross2: number, 
    baseChromosome: Tile[], newFixedBlock: Tile[], oldblock: Tile[]): Tile[]
  {
    //console.log("baseChromosome", baseChromosome);

    //let newChromosome = baseChromosome.concat();
    //newChromosome.splice(indexToCross1, indexToCross2 - indexToCross1, ...newFixedBlock);
    
    let newChromosome = [];

    for (let index = 0; index < baseChromosome.length; index++) 
    {
      /// it is not inside the new fixed part - indexToCross2 is a end not included
      if(index < indexToCross1 || index > indexToCross2 -1)
      {
        newChromosome.push( this.getNoRepeatedGene(baseChromosome[index], newFixedBlock, oldblock) );
      }
      else
      {
        newChromosome.push(newFixedBlock[index - indexToCross1]);
      }
    }

    // console.log("oldblock", oldblock);
    // console.log("newFixedBlock", newFixedBlock);
    // console.log("newChromosome", newChromosome);
    // console.log("baseChromosome", baseChromosome);
    return newChromosome;
  }

  getNoRepeatedGene(gene: Tile, fixedBlock: Tile[], replacedBlock: Tile[]): Tile
  {
    //let getIndexOfLocation = 
    //if( this.hasLocationID(fixedBlock, gene) )
    if( fixedBlock.includes(gene) )    
    {
      //console.log("fixedBlock.indexOf(gene)", fixedBlock.indexOf(gene));
      return this.getNoRepeatedGene(replacedBlock[fixedBlock.indexOf(gene)], fixedBlock, replacedBlock);
    }
    return gene;
  }
  
  applyMutation(population: individual[]) 
  {
    let newChromosome;
    let mutationApplied = false;
    //console.log("applyMutation");
    for (let j = 0; j < population.length; j++) 
    {
      let indiv = population[j];
      newChromosome = indiv.chromosome.concat();
      switch (this.mutationMode) 
      {
        case "Gene":
          //console.log("applyMutation Gene");
          [mutationApplied, newChromosome] = this.tryMutationInGenes(newChromosome);
          break;
        case "Individuo":
          //console.log("applyMutation tryOneMutation");
          [mutationApplied, newChromosome] = this.tryOneMutation(newChromosome);
          break;
        default:
          //console.log("applyMutation default");
          return null;
          break;
      }

      if (mutationApplied) 
      {
        population.splice(j, 1, this.getIndividual(newChromosome));
        //console.log(newChromosome.concat());
        //console.log(indiv.chromosome.concat());
      } 
    }
  }

  tryMutationInGenes(baseChromosome: Tile[]): [boolean, Tile[]]
  {
    let mutationApplied = false;
    let newChromosome: Tile[];
    for (let varIndex = 0; varIndex < baseChromosome.length; varIndex++) 
      {
        if (Math.random() < this.probMutacao) 
        {
          //console.log("mutation in individual " + j + " chromosome " + k);
          mutationApplied = true;
          //console.log("before mutation" + indiv.chromosome[k]);
          newChromosome = this.knightSwapMutation(varIndex, baseChromosome);
          //console.log("after mutation" + indiv.chromosome[k]);
        }
      }
      if(mutationApplied)
      {
        return [mutationApplied, newChromosome];
      }
      else
      {
        return [mutationApplied, baseChromosome];
      }
  }

  tryOneMutation(chromosome: Tile[]): [boolean, Tile[]]
  {
    if (Math.random() < this.probMutacao)
    {
      let index1 = Math.floor(Math.random() * 45);
      this.knightSwapMutation(index1, chromosome);
      chromosome = this.getKnightTour(index1,chromosome);
      return [true, chromosome];
    }
    return [false, chromosome];
  }

  //getTilesInWrong 

  knightSwapMutation(indexToSwap: number, chromosome: Tile[]): Tile[]
  {
    
    ///to get a valid bit for the indexToSwap
    let allowedDests: Tile[]; //= chromosome[indexToSwap-1].allowedDest.concat();
    if(indexToSwap === 0)
    {
      allowedDests = chromosome[chromosome.length-1].allowedDest.concat();
    }
    else
    {
      // console.log("knightSwapMutation indexToSwap ",indexToSwap);
      // console.log("knightSwapMutation chromosome ",chromosome.concat());
      // console.log("knightSwapMutation indexToSwap-1 ",(indexToSwap-1));
      allowedDests = chromosome[(indexToSwap-1)].allowedDest.concat();
    }    
    
    //console.log("knightSwapMutation allowedDests", allowedDests.concat());
    
    let newAllowedDestiny = allowedDests[this.getRamdomInt(allowedDests.length)];
    let index2 = chromosome.indexOf(newAllowedDestiny);
    let gene1 = chromosome[indexToSwap];
    let gene2 = chromosome[index2];
    chromosome[indexToSwap] = gene2;
    chromosome[index2] = gene1;
    return this.getKnightTour(indexToSwap, chromosome);
  }

  swapMutation(indexToSwap: number, chromosome: Tile[])
  {
    let index2 = Math.floor(Math.random() * chromosome.length);
    let gene1 = chromosome[indexToSwap];
    let gene2 = chromosome[index2];
    chromosome[indexToSwap] = gene2;
    chromosome[index2] = gene1;
  }

  /// change if cycle
  getbiggerValidKnightWay(chromosome: Tile[]): Tile[]
  {
    let biggerValidWay: Tile[] = [];
    let tempWay: Tile[] = [];

    tempWay.push(chromosome[0])

    for (let index = 0; index < chromosome.length - 1; index++) {
      let tile = chromosome[index];
      let nextTile = chromosome[index+1];      
      
      if(tile.allowedDest.includes(nextTile)){
        //console.log("tile", tile);
        //console.log("nextTile", nextTile);
        //console.log(tile.id + ", "+ nextTile.id);
        tempWay.push(nextTile);
      }
      else ///find an invalid... ask if was the big way
      {
        if(tempWay.length > biggerValidWay.length)
        {
          biggerValidWay = tempWay.concat();
        }
        tempWay.length = 0;
        /// change this if you consider backward correction
        return biggerValidWay
      }
    }
    return biggerValidWay;  
  }  

  ///adaptative
  // refactorChromosome(chromosome: Tile[], refactorStar: number, refactorEnd: number)
  // {

  // }

  completeKnightTour(chromosome: Tile[], startToModify)
  {
    chromosome = this.getKnightTour(startToModify, chromosome);
  }

  /// change if cycle
  getKnightTour(lastIndexToKeep: number = 0, baseChromosome: Tile[] = []): Tile[]
  {
    let nextTile: Tile;
    ///+1 to include startChangeIndex
    let newChromosome = baseChromosome.slice(0, lastIndexToKeep + 1);
    let tilesToVisit = [];
    
    if(newChromosome.length === 0)
    {
      newChromosome.push(this.destinations[this.getRamdomInt(this.numOfVariables)]);
    }

    for (const tile of this.destinations) {
      if(!newChromosome.includes(tile))
      {
        tilesToVisit.push(tile)
      }
    }
    //console.log("newChromosome", newChromosome.concat());
    //console.log("tilesToVisit", tilesToVisit.concat());
    //console.log("baseChromosome", baseChromosome.concat());

    for (let index = lastIndexToKeep; index < this.numOfVariables - 1; index++) {
      console.log("index ",index);
      console.log("newChromosome.concat", newChromosome.concat());
      console.log("newChromosome[index] ", newChromosome[index]);

      //nextTile = this.getNextValid(newChromosome[index], newChromosome);
      nextTile = this.getMoreLonelyNeighbor(newChromosome[index].allowedDest, newChromosome);
      //console.log("nextTile after", nextTile);
      if(!nextTile)
      {
        console.log("not got nextValid");
        let randomPos = this.getRamdomInt(tilesToVisit.length);
        //console.log("randomPos tilesToVisit", randomPos);
        nextTile = tilesToVisit[randomPos];
        
        //console.log("tilesToVisit after", tilesToVisit.concat());
      }
      tilesToVisit.splice(tilesToVisit.indexOf(nextTile), 1);
      newChromosome.push(nextTile);
      //console.log("newChromosome after", newChromosome.concat());
    }

    return newChromosome;
  }

  /// change if cycle
  /// starts seeing the next tile of the starts indexes
  getLimitedKnightTour(startSmarIndex: number = 0, startRandomIndex: number = Math.floor(0.8   * this.numOfVariables), baseChromosome: Tile[] = []): Tile[]
  {
    //console.log("startRandomIndex", startRandomIndex);
    let nextTile: Tile;
    ///+1 to include startChangeIndex
    let newChromosome = baseChromosome.slice(0, startSmarIndex + 1);
    let tilesToVisit = [];
    
    if(newChromosome.length === 0)
    {
      newChromosome.push(this.destinations[this.getRamdomInt(this.numOfVariables)]);
    }

    for (const tile of this.destinations) {
      if(!newChromosome.includes(tile))
      {
        tilesToVisit.push(tile)
      }
    }
    //console.log("newChromosome", newChromosome.concat());
    //console.log("tilesToVisit", tilesToVisit.concat());
    //console.log("baseChromosome", baseChromosome.concat());

    for (let index = startSmarIndex; index < startRandomIndex; index++) {
      console.log("index ",index);
      console.log("newChromosome[index] ", newChromosome[index]);

      //nextTile = this.getNextValid(newChromosome[index], newChromosome);
      nextTile = this.getMoreLonelyNeighbor(newChromosome[index].allowedDest, newChromosome);
      //console.log("nextTile after", nextTile);
      if(!nextTile)
      {
        console.log("not got nextValid");
        let randomPos = this.getRamdomInt(tilesToVisit.length);
        console.log("randomPos tilesToVisit", randomPos);
        nextTile = tilesToVisit[randomPos];
        
        console.log("tilesToVisit after", tilesToVisit.concat());
      }
      tilesToVisit.splice(tilesToVisit.indexOf(nextTile), 1);
      newChromosome.push(nextTile);
      //console.log("newChromosome after guided", newChromosome.concat());
    }

    for (let index = startRandomIndex; index < this.numOfVariables - 1; index++) {
      //console.log("index ",index);
      //console.log("newChromosome[index] ", newChromosome[index]);
      let randomPos = this.getRamdomInt(tilesToVisit.length);
        //console.log("randomPos tilesToVisit", randomPos);
      nextTile = tilesToVisit[randomPos];
      if(!nextTile)
      {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAA");
        console.log("tilesToVisit after", tilesToVisit.concat());
        console.log("randomPos after", randomPos);
        console.log("nextTile after", randomPos);
        
      }
      tilesToVisit.splice(randomPos, 1);
      newChromosome.push(nextTile);
      //console.log("newChromosome after", newChromosome.concat());
    }

    return newChromosome;
  }

  ///don't forget to push nextTile where you want to push it
  ///and or to take out it from the available places to visit
  getNextValid(currentTile: Tile, occupiedTiles: Tile[]): Tile
  {
    let nextTile:Tile;
    let remaindAllowedDests = currentTile.allowedDest.concat();
    //console.log("remaindAllowedDests ", remaindAllowedDests);
    let randomPos: number;
    while(remaindAllowedDests.length > 0 )
    {
      randomPos = this.getRamdomInt(remaindAllowedDests.length);
      //console.log("randomPos ", randomPos);
      nextTile = remaindAllowedDests[randomPos];
      //console.log("nextTile ", nextTile);
      ///se já está ocupado, remova e continue tentando, caso contrário, retorne o endereço encontrado em que não se passou
      if(occupiedTiles.includes(nextTile))
      {
        remaindAllowedDests.splice(randomPos, 1);
        //console.log("occupiedTiles includes ");
      }
      else
      {
        //console.log("occupiedTiles n includes ");
        return nextTile;
      }
    }

    nextTile = undefined;
    return nextTile;
  }

  getMoreLonelyNeighbor(neighbors: Tile[], occupiedTiles: Tile[])
  {
    let remaindAllowedDests = this.getEmptyNeighbors(neighbors, occupiedTiles);
    let lonelyNeighbor: Tile;
    
    ///if there is no empty neighbor  
    if(remaindAllowedDests.length === 0)
    {
      console.log("To see if is undefined lonelyNeighbor ", lonelyNeighbor);
      return undefined;
    }

    lonelyNeighbor = remaindAllowedDests[0];

    for (const neighbor of remaindAllowedDests)
    {
      if(this.getEmptyNeighbors(neighbor.allowedDest, occupiedTiles).length <
          this.getEmptyNeighbors(lonelyNeighbor.allowedDest, occupiedTiles).length
      )
      {
        lonelyNeighbor = neighbor;
      }
    }

    return lonelyNeighbor;
  }

  getEmptyNeighbors(neighbors: Tile[], occupiedTiles: Tile[]): Tile[]
  {
    let remaindAllowedDests = neighbors.concat();
    for (const tile of remaindAllowedDests) {
      if(occupiedTiles.includes(tile))
      {
        remaindAllowedDests.splice(remaindAllowedDests.indexOf(tile), 1);
      }
    }
    return remaindAllowedDests;
  }

  getRandomTour() : Tile[]
  {
    let chromosome: Tile[] = [];
    //console.time();    
    let remainderDests = this.destinations.concat();
    //console.timeEnd();
    let ramdomNum;
    while(remainderDests.length > 0)
    {
      ramdomNum = Math.floor(Math.random() * remainderDests.length);
      //console.log("ramdomNum ", ramdomNum);
      let selectedDest = remainderDests[ramdomNum];
      //console.log("selectedDest", selectedDest);
      chromosome.push(selectedDest);

      remainderDests.splice(ramdomNum, 1);
    }
    return chromosome;
  }
  

  selectIndividual(ci: number[]): number {
    //console.log(ci);
    let randomNumber = Math.random();
    let selectedIndex = 0;
    while (randomNumber > ci[selectedIndex]) 
    {
      selectedIndex++;
    }
    //console.log("selectIndividual " + "randomNumber[" + randomNumber + "]" + " selectedIndex[" + selectedIndex + "]"+ " ci[" + ci[selectedIndex] + "]");
    return selectedIndex;
  }

  selectInitialPopulation(): individual[] 
  {
    let currentGeneration: individual[] = [];

    for (let i = 0; i < this.populationSize; i++) 
    {
      //console.log("selectInitialPopulation: " + i);
      currentGeneration.push(  this.getIndividual(this.getKnightTour())  );
    }
    return currentGeneration;
  }

  getIndividual(chromosome: Tile[]): individual {
    //console.log("getIndividual");
    let indiv: individual = {
      chromosome: chromosome.concat(),
    };

    indiv.numOfValidKnightMoviments = this.calcNumOfValidMoviments(indiv);
    indiv.fitness = this.calcFitness(indiv);

    ///getting the best individuals
    this.evaluateIndividual(indiv);
    //console.log("getIndividual", indiv);
    return indiv;
  }

  evaluateIndividual(indiv: individual) 
  {
    let insertedInd;
    //let bestIndFull = this.bestInd.length == this.numOfBestToKeep;
    for (let i = 0; i < this.bestInd.length && i < this.numOfBestToKeep; i++) 
    {
      insertedInd = false;
      if (this.hasIndividual(indiv)) 
      {
        //console.log("Already in the best");
        insertedInd = true;
        return;
      } 
      else if (indiv.fitness > this.bestInd[i].fitness) 
      {
        insertedInd = true;
        //indiv.generation = this.numCurrentGeneration;
        if (this.bestInd.length == this.numOfBestToKeep)
          // if it is full, removes one to insert
          this.bestInd.splice(i, 1, indiv);
        else {
          this.bestInd.splice(i, 0, indiv);
        }
        break;
      }
    }
    if (!insertedInd && this.bestInd.length < this.numOfBestToKeep) 
    {
      /// if it was not inserted and there is space
      insertedInd = true;
      //indiv.generation = this.numCurrentGeneration;
      this.bestInd.push(indiv);
    }

    if (insertedInd) 
    {
      indiv.generation = this.numCurrentGeneration;
      //console.log("bestInd");
      //console.log(this.bestInd);
    }
  }

  hasIndividual(indiv: individual) 
  {
    let containsInd = false;
    this.bestInd.forEach(element => {
      let areAllVarEqual = true;
      for (const iVar in element.chromosome) {
        ///////
        if(element.chromosome[iVar] != indiv.chromosome[iVar])
        {
          areAllVarEqual = false;
          break;
        }
      }
      if(areAllVarEqual)
      {
        containsInd = true;
        return containsInd;
      }
    });
    return containsInd;
  }

  getRamdomInt(maxExclusive: number)
  {
    return Math.floor(Math.random() * maxExclusive);
  }

  calcFitness(indiv: individual): number 
  {
    //console.log("calcFitness");
    let fitness = 0;
    //indiv.totalDistance = this.getTotalDistance(indiv);
    //fitness = this.calcNumOfValidMoviments(indiv);
    //console.log("indiv", indiv);
    fitness = this.getbiggerValidKnightWay(indiv.chromosome).length;
    //console.log("fitness", fitness)
    if(fitness < 0) 
    {
      console.log("SO BIG DISTANCE! MORE THAN EARTH RADIUS!");
      fitness = 0;
    }
    return fitness;
  }

  calcNumOfValidMoviments(indiv: individual): number
  {
    let count = 0;
    let before = indiv.chromosome.length;
    ////change if cycle
    for (let index = 0; index < indiv.chromosome.length - 1; index++) {
      let tile = indiv.chromosome[index];
      let nextTile = indiv.chromosome[index+1];      
      
      if(tile.allowedDest.includes(nextTile)){
        //console.log("calcNumOfValidMoviments", indiv);
        //console.log("tile", tile);
        //console.log("nextTile", nextTile);
        count++;
        //console.log(tile.id + ", "+ nextTile.id);
      }
      else{
        
      }
      
    }
    indiv.numOfValidKnightMoviments = count;
    return count;
  }

  binArrayToDecimal(bits: number[]) 
  {
    let decimalValue = 0;
    for (let i = 0; i < bits.length; i++)
      decimalValue += bits[i] * Math.pow(2, i);

    //console.log("binArrayToDecimal: " + decimalValue);
    return decimalValue;
  }

  calcFitnessAverage(generation: individual[]): number {
    let averageFit: number = 0;
    generation.forEach(element => {
      averageFit += element.fitness;
    });
    averageFit /= generation.length;
    return averageFit;
  }
  
  /////////////////////
}

interface individual {
  /// indicates the order to visit the cities, that is, the tour
  chromosome?: Tile[];

  ///totalDistance summing the distances between all places in the chromosome, including between the last and the first
  numOfValidKnightMoviments?: number;

  ///indicates how much the the individual is good (generally is f(x)+c)
  fitness?: number;

  ///generation number
  generation?: number;

}
 
declare interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}