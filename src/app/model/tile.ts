
export class Tile {

  //state: string;
  id: number;
  coordinates: number[];
  //allowedMove: number[][];
  allowedDest: Tile[];

  constructor(line: number, column: number, numOfColumns: number) {
    this.id = line * numOfColumns + column ;
    this.coordinates = [];
    this.coordinates.push(line)
    this.coordinates.push(column)
    //this.state = 'empty';
    this.allowedDest = [];
    console.log("constructor");
  }

  addAllowedKnightMove(allowedDest: Tile)
  {
    this.allowedDest.push(allowedDest);
  }

}
