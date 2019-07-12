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

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState();
  }

  getInitState() {
    return {
      cells: this.getNewCellData(this.props.numPairs),
      clickedCells: [],
      score: 0,
      numMatchedCells: 0,
      gameOver: false,
      locked: false
    };
  }

  getNewCellData(numPairs) {
    const allCellData = [];
    const colors = _.sampleSize(this.props.cellColors, numPairs);
    for(let i = 0; i < numPairs; i++) {
      const chosenColor = colors[i];
      allCellData.push({color: chosenColor, hidden: true, matched: false});
      allCellData.push({color: chosenColor, hidden: true, matched: false});
    }
    return _.shuffle(allCellData);
  };

  handleNewGameClick() {
    if(this.state.locked) return;
    this.setState(this.getInitState());
  }

  handleCellClick(i) {
    if(this.state.locked) return;

    if(this.state.clickedCells.length === 0) { 
      this.handleFirstClick(i);
    } else { 
      this.handleSecondClick(i);
    }
  }

  handleFirstClick(i) {
    const cellsCopy = this.state.cells.slice();    
    cellsCopy[i].hidden = false;
    this.setState({
      clickedCells: [ i ], 
      cells: cellsCopy
    });
  }

  handleSecondClick(i) {
    // silently reject click if the two cells are the same
    const prevIndex = this.state.clickedCells[0];
    if(i === prevIndex) { return; }

    this.setState({ locked: true });

    const cellsCopy = this.state.cells.slice();
    cellsCopy[i].hidden = false;
    this.setState({ cells: cellsCopy });

    const prevCell = this.state.cells[prevIndex];
    const newCell = this.state.cells[i];
    const guessedCorrectly = newCell.color === prevCell.color;

    if(guessedCorrectly) {
      this.handleCorrectGuess(i, prevIndex);
    } else {
      this.handleIncorrectGuess(i, prevIndex);
    }
  }

  handleCorrectGuess(newIndex, prevIndex) {
    const newScore = this.state.score + this.props.correctScoreIncrement;
    const newMatchedCells = this.state.numMatchedCells + 2;
    const gameOver = newMatchedCells === this.props.numCells;
    
    this.setState({
      clickedCells: [],
      score: newScore,
      numMatchedCells: newMatchedCells,
      gameOver: gameOver
    });
    
    setTimeout(() => {
      const cellsCopy = this.state.cells.slice();
      cellsCopy[prevIndex].matched = true;
      cellsCopy[newIndex].matched = true;
      this.setState({
        cells: cellsCopy,
        locked: false
      });
    }, this.props.timeoutInterval);
  }

  handleIncorrectGuess(newIndex, prevIndex) {
    const newScore = this.state.score + this.props.incorrectScoreIncrement;
    this.setState({
      clickedCells: [],
      score: newScore
    });

    setTimeout(() => {
      const cellsCopy = this.state.cells.slice();
      cellsCopy[prevIndex].hidden = true;
      cellsCopy[newIndex].hidden = true;
      this.setState({
        cells: cellsCopy,
        locked: false
      });
    }, this.props.timeoutInterval);
  }

  render() {
    return (
      <div className="container">
        <h1>
          <span role="img" aria-label="men holding hands">👬</span>
          Matching Pairs
          <span role="img" aria-label="women holding hands">👭</span>
        </h1>

        { this.renderStatusContainer() }
        { this.renderGrid() }

      </div>
    );
  }

  renderStatusContainer() {
    if(this.state.gameOver) {
     return (
        <div className="status-container">
          <h2>Game Over!</h2>
          <p className="lead">Final score: {this.state.score}</p>
          { this.renderResetButton("Play Again") }
        </div>
      );
    } else {
      return (
        <div className="status-container">
          <p className="lead">Score: {this.state.score}</p>
          { this.renderResetButton("New Game") }
        </div>
      );
    }
  }

  renderGrid() {
    let rows = [];
    for(let i = 0; i < this.props.numCells; i += this.props.cellsPerRow) {
      rows.push(this.renderRow(i, i + this.props.cellsPerRow - 1));
    }
    return (
      <div className="grid-container">
        { rows }
      </div>
    );
  }

  renderRow(startCell, endCell) {
    let rowElements = [];
    for(let i = startCell; i <= endCell; i++) {
      rowElements.push(this.renderCell(i));
    }
    return (
      <div className="board-row" key={ "row" + startCell + "_" + endCell }>
        { rowElements }
      </div>
    );
  }

  renderCell(i) {
    const cellData = this.state.cells[i];
    if(cellData.matched) {
      // render special disabled button
      return <button key={ "cell" + i } className="cell matched" disabled />
    }
    const viewColor = cellData.hidden ? "hidden" : cellData.color;
    const classNames = ["cell", viewColor];
    return <button key={ "cell" + i }
                   className={classNames.join(" ")} 
                   onClick={() => this.handleCellClick(i)}/>
  }

  renderResetButton(text) {
    return (
      <button className="btn btn-outline-success btn-sm" 
              onClick={() => this.handleNewGameClick()}>
        { text }
      </button>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="container app-container text-center">
        <Grid cellColors={CELL_COLORS} 
              numPairs={NUM_PAIRS} 
              numCells={NUM_PAIRS * 2}
              cellsPerRow={CELLS_PER_ROW}
              correctScoreIncrement={MATCH_SCORE_INCREMENT} 
              incorrectScoreIncrement={ERROR_SCORE_INCREMENT}
              timeoutInterval={TIMEOUT_INTERVAL} />
      </div>
    )
  }
}

export default App;