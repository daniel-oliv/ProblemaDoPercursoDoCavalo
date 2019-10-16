import {Tile} from '../model/tile';

export class Board {

    rows: Tile[][];
    tiles: Tile[];
    numLines;
    numColumns;

    knigthMovements = [
      ///one in horizon and two in vertical
      [-1,-2],
      [-1, 2],
      [ 1,-2],
      [ 1, 2],
      ///two in horizon and 1 in vertical
      [-2,-1],
      [-2, 1],
      [ 2,-1],
      [ 2, 1],
    ];
  
    constructor(numOfLines: number, numOfColumns: number) {
      this.numLines = numOfLines;
      this.numColumns = numOfColumns;
      this.rows = [];
      this.tiles = [];
      for (let i = 0; i < this.numLines; i++) {
        let row = [];
        for (let j = 0; j < this.numColumns; j++) {
          let tile = new Tile(i,j, this.numColumns)
          this.tiles.push(tile);
          row.push(tile);
        }
        this.rows.push(row);
      }
      this.setPossibleKnightWays();
    }
  
    setPossibleKnightWays()
    {
      for (const row in this.rows) {
        for (const column in this.rows[row]) {
          let tile = this.rows[row][column];
          let currentCoordinates = tile.coordinates.concat();
          //console.log("currentCoordinates", currentCoordinates);
          for (const movement of this.knigthMovements) {
            let nextX = currentCoordinates[0] + movement[0];
            let nextY = currentCoordinates[1] + movement[1];
            if((nextX >= 0 && nextX < this.numLines) && (nextY >= 0 && nextY < this.numColumns))
            {
              let allowedDest = [nextX, nextY];
              tile.addAllowedKnightMove(this.rows[nextX][nextY]);
              //console.log("allowedDest", allowedDest);
            }
          }
          //console.log(tile);
        }
      }
      
    }
  
  }