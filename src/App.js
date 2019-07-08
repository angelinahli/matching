import React from 'react';
import './App.css';

// random helper functions - seems like there should be a built in package

function randomChoose(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function randomShuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// program helper functions

const CELL_COLORS = ["green", "yellow", "orange", "purple", "blue"];
const NUM_PAIRS = 8;
const MATCH_SCORE_INCREMENT = 1;
const ERROR_SCORE_INCREMENT = -1;

class Cell extends React.Component {
  render() {
    var cNameAttributes = ["cell"];
    if(this.props.matched) { cNameAttributes.push("matched"); }
    
    if(this.props.hidden) { cNameAttributes.push("hidden"); }
    else { cNameAttributes.push(this.props.color); }

    return <button className={cNameAttributes.join(" ")} onClick={() => this.props.onClick()}/>
  }
}

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cells: this.getInitialCellData(this.props.numPairs),
      clickedCellIndices: [],
      score: 0,
      numMatchedCells: 0
    }
  }

  getInitialCellData(numPairs) {
    const allCellData = [];
    for(let i = 0; i < numPairs; i++) {
      const chosenColor = randomChoose(this.props.cellColors);
      allCellData.push({color: chosenColor, hidden: true, matched: false});
      allCellData.push({color: chosenColor, hidden: true, matched: false});
    }
    randomShuffle(allCellData);
    return allCellData;
  };

  renderCell(i) {
    const cellData = this.state.cells[i];
    return <Cell color={cellData.color} 
                 hidden={cellData.hidden} 
                 matched={cellData.matched}
                 onClick={() => this.handleClick(i)} />;
  }

  handleClick(i) {
    // hacky fix for matched cells
    if(this.state.cells[i].matched || this.state.won) return;
    else if(this.state.clickedCellIndices.length === 1) { this.handleSecondClick(i); }
    else { this.handleFirstClick(i); }
  }

  handleFirstClick(i) {
    const currentCells = this.state.cells.slice();
    // handle previously clicked cells
    this.state.clickedCellIndices.map(
      j => { if(!currentCells[j].matched) { currentCells[j].hidden = true; } })
    // handle current cell
    currentCells[i].hidden = false;
    this.setState({clickedCellIndices: [i], cells: currentCells});
  }

  handleSecondClick(i) {
    const currentCells = this.state.cells.slice();
    const newCell = currentCells[i];
    const prevIndex = this.state.clickedCellIndices[0];
    const prevCell = currentCells[prevIndex];
    // handle default actions
    newCell.hidden = false;

    // handle score state
    const matched = newCell.color === prevCell.color;
    let newScore = this.state.score;
    let newMatchedCells = this.state.numMatchedCells;

    if(matched) {
      prevCell.matched = true;
      newCell.matched = true;
      newScore += this.props.matchScoreIncrement;
      newMatchedCells += 2;
    } else {
      newScore += this.props.errorScoreIncrement;
    }

    this.setState({
      clickedCellIndices: [i, prevIndex], 
      cells: currentCells, 
      score: newScore, 
      numMatchedCells: newMatchedCells});
  }

  render() {
    const won = this.state.numMatchedCells === this.props.numCells;
    if(won) {
      var header = <h2>You Won! Final score: {this.state.score}</h2>;
    } else {
      var header = <h2>Score: {this.state.score}</h2>;
    }

    return (
      <div className="grid-container">
        { header }
        <div className="board-row">
          { this.renderCell(0) }
          { this.renderCell(1) }
          { this.renderCell(2) }
          { this.renderCell(3) }
        </div>
        
        <div className="board-row">
          { this.renderCell(4) }
          { this.renderCell(5) }
          { this.renderCell(6) }
          { this.renderCell(7) }
        </div>

        <div className="board-row">
          { this.renderCell(8) }
          { this.renderCell(9) }
          { this.renderCell(10) }
          { this.renderCell(11) }
        </div>

        <div className="board-row">
          { this.renderCell(12) }
          { this.renderCell(13) }
          { this.renderCell(14) }
          { this.renderCell(15) }
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="container text-center">
        <h1>Matching Pairs</h1>
        <Grid cellColors={CELL_COLORS} 
              numPairs={NUM_PAIRS} 
              numCells={NUM_PAIRS * 2}
              matchScoreIncrement={MATCH_SCORE_INCREMENT} 
              errorScoreIncrement={ERROR_SCORE_INCREMENT} />
      </div>
    )
  }
}

export default App;