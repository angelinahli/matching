import React from 'react';
import _ from 'lodash';
import './App.css';

const CELL_COLORS = ["green", "yellow", "orange", "burgundy", "lilac", "blue", 
                     "mint", "cyan"];
const NUM_PAIRS = 8;
const CELLS_PER_ROW = 4;
const MATCH_SCORE_INCREMENT = 5;
const ERROR_SCORE_INCREMENT = -1;
const TIMEOUT_INTERVAL = 500;

const cellMode = {
  HIDDEN: "hidden",
  MATCHED: "matched",
  VISIBLE: "visible"
}

const gameMode = {
  INPLAY: "in play",
  GAMEOVER: "game over",
  LOCKED: "locked"
}

class Cell {
  constructor(color) {
    this.color = color;
    this.mode = cellMode.HIDDEN;
  }
}

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState();
  }

  getInitState() {
    return {
      cells: this.getNewCellData(this.props.numPairs),
      visibleCells: [],
      score: 0,
      numMatchedCells: 0,
      mode: gameMode.INPLAY
    };
  }

  getNewCellData(numPairs) {
    const allCellData = [];
    const colors = _.sampleSize(this.props.cellColors, numPairs);
    for(let i = 0; i < numPairs; i++) {
      const chosenColor = colors[i];
      allCellData.push(new Cell(chosenColor));
      allCellData.push(new Cell(chosenColor));
    }
    return _.shuffle(allCellData);
  };

  handleNewGameClick() {
    // only handle if appropriate; ignore otherwise
    if(this.state.mode === gameMode.LOCKED) return;
    this.setState(this.getInitState());
  }

  handleCellClick(i) {
    // only handle if appropriate; ignore otherwise
    if(this.state.mode !== gameMode.INPLAY) return;

    if(this.state.visibleCells.length === 0) { 
      this.handleFirstClick(i);
    } else { 
      this.setState(
        // game must be locked first
        { mode: gameMode.LOCKED },
        () => this.handleSecondClick(i));
    }
  }

  handleFirstClick(i) {
    this.setState({ visibleCells: [ i ] });
    this.changeCellMode(i, cellMode.VISIBLE);
  }

  changeCellMode(i, newMode) {
    this.setState(
      (prevState, props) => {
        const cellsCopy = prevState.cells.slice();
        cellsCopy[i].mode = newMode;
        return { cells: cellsCopy };
      }
    );
  }

  handleSecondClick(i) {
    this.changeCellMode(i, cellMode.VISIBLE);

    const prevIndex = this.state.visibleCells[0];
    const prevCell = this.state.cells[prevIndex];
    const newCell = this.state.cells[i];
    const correctGuess = newCell.color === prevCell.color;

    if(correctGuess) {
      this.handleCorrectGuess(i, prevIndex);
    } else {
      this.handleIncorrectGuess(i, prevIndex);
    }
  }

  handleCorrectGuess(newIndex, prevIndex) {
    this.setState(
      (prevState, props) => {
        const newMatchedCells = prevState.numMatchedCells + 2;
        const gameOver = newMatchedCells === props.numCells;
        const newMode = gameOver ? gameMode.GAMEOVER : prevState.mode;
        return {
          visibleCells: [],
          score: prevState.score + props.correctScoreIncrement,
          numVisible: prevState.numVisible + 1,
          numMatchedCells: newMatchedCells,
          mode: newMode
        }
      }
    );
    
    setTimeout(() => {
        this.changeCellMode(prevIndex, cellMode.MATCHED);
        this.changeCellMode(newIndex, cellMode.MATCHED);
        this.setState(
          (prevState, props) => ({ 
            mode: prevState.mode === gameMode.GAMEOVER ? gameMode.GAMEOVER : gameMode.INPLAY
          })
        );
    }, this.props.timeoutInterval);
  }

  handleIncorrectGuess(newIndex, prevIndex) {
    this.setState(
      (prevState, props) => ({
        visibleCells: [],
        score: prevState.score + props.incorrectScoreIncrement
      })
    );

    setTimeout(() => {
      this.changeCellMode(prevIndex, cellMode.HIDDEN);
      this.changeCellMode(newIndex, cellMode.HIDDEN);
      this.setState({ mode: gameMode.INPLAY });
    }, this.props.timeoutInterval);
  }

  render() {
    return (
      <div className="app-container text-center container">
        <h1>
          👬 Matching Pairs 👭
        </h1>

        { this.renderStatusContainer() }
        { this.renderGrid() }

      </div>
    );
  }

  renderStatusContainer() {
    if(this.state.mode === gameMode.GAMEOVER) {
     return (
        <div className="status-container">
          <h2>Game Over!</h2>
          <p className="lead">Final score: <b>{this.state.score}</b></p>
          { this.renderResetButton("Play Again") }
        </div>
      );
    } else {
      return (
        <div className="status-container">
          <p className="lead">Score: <b>{this.state.score}</b></p>
          { this.renderResetButton("New Game") }
        </div>
      );
    }
  }

  renderGrid() {
    const gridElements = [];
    for(let i = 0; i < this.props.numCells; i++) {
      gridElements.push(this.renderCell(i));
    }

    return (
      <div className="container grid-container">
        { gridElements }
      </div>
    );
  }

  renderCell(i) {
    const cellData = this.state.cells[i];
    const key = "cell" + i;
    switch(cellData.mode) {
      case cellMode.MATCHED: {
        return <button key={ key } className="cell matched" disabled />;
      }
      case cellMode.VISIBLE: {
        return <button key={ key } className={ "cell " + cellData.color } disabled />;
      }
      case cellMode.HIDDEN: {
        return <button key={ key } className="cell hidden" onClick={() => this.handleCellClick(i)} />;
      }
    }
  }

  renderResetButton(text) {
    return (
      <button className="btn btn-success" 
              onClick={() => this.handleNewGameClick()}>
        { text }
      </button>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row">

          <div className="col-lg-3 col-md-2" />

          <div className="col-lg-6 col-md-8">
            <Grid cellColors={CELL_COLORS} 
                  numPairs={NUM_PAIRS} 
                  numCells={NUM_PAIRS * 2}
                  cellsPerRow={CELLS_PER_ROW}
                  correctScoreIncrement={MATCH_SCORE_INCREMENT} 
                  incorrectScoreIncrement={ERROR_SCORE_INCREMENT}
                  timeoutInterval={TIMEOUT_INTERVAL} />
          </div>

          <div className="col-lg-3 col-md-2" />

        </div>
      </div>
      
    )
  }
}

export default App;