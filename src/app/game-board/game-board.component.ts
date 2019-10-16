import {Component, OnInit, Input} from '@angular/core';
import {COLORS} from '../app.constants';
// import {Board} from '../game-engine/board/board';
import {Tile} from '../model/tile';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { Board } from '../model/board';
// import {MdSnackBar} from '@angular/material';
// import {Piece} from '../game-engine/pieces/piece';
// import {Move} from '../game-engine/move/move';
// import {MoveTransition} from '../game-engine/move/move-transition';
// import {MoveStatus} from '../game-engine/move/move-status';
// import {MoveFactory} from '../game-engine/move/move-factory';
// import {NullMove} from '../game-engine/move/null-move';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
  animations: [
    trigger('tileState', [
      state('inactive', style({
        transform: 'scale(1)'
      })),
      state('active', style({
        backgroundColor: '#faa009',
        border: '1px solid #b37104',
        transform: 'scale(1.1)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})
export class GameBoardComponent implements OnInit {

  rows: any[];
  tiles: any[];
  numLines;
  numColumns;
  @Input() board: Board;

  highLightLegalMoves: boolean;

  constructor() { 
    console.log("GameBoardComponent constructor");
  }

  ngOnInit() {   
    console.log("GameBoardComponent ngOnInit");
    this.rows = this.board.rows;
    this.tiles = this.board.tiles;
  }

  getStyling(row: number, col: number) {
    if ((row + col) % 2) {
      return COLORS.WHITE;
    } else {
      return COLORS.BLACK;
    }
  }

  /**
   * Execute this function whenever user clicks on a tile,
   * TODO: implement functionality of user deselecting an already selected piece on right mouse click
   * @param clickedTile
   */
  onTileClick(clickedTile: Tile) {

  }

  private resetVariables() {
    // reset source and destination tile now
  }

  private moveThePiece() {
    
  }

  private onHighLightStatusChanged(changedStatus: boolean) {
    
  }

  checkTileState(tile: Tile): string {
    return '';
  }
}


