import React from 'react';
import './App.css';

// random helper functions - seems like there should be a built in package

const CELL_COLORS = ["green", "yellow", "orange", "burgundy", "lilac", "blue", "mint", "cyan"];
const NUM_PAIRS = 8;
const MATCH_SCORE_INCREMENT = 5;
const ERROR_SCORE_INCREMENT = -1;
const TIMEOUT_INTERVAL = 750;

const random = {
  shuffle: function(array) {
    // shuffles an array in place
    array.sort(() => Math.random() - 0.5);
  },
  sample: function(array, n) {
    // return a random sample from an array without repeats
    var arrayClone = array.slice();
    random.shuffle(arrayClone);
    return arrayClone.slice(0, n);
  }
}

class Cell extends React.Component {
  // props: {color: ..., hidden: ..., matched: ..., onClick: ...}
  render() {
    if(this.props.matched) {
      // render special disabled button
      return <button className="cell matched" onClick={() => this.props.onClick()} disabled />
    }

    const viewColor = this.props.hidden ? "hidden" : this.props.color;
    const cNameAttributes = ["cell", viewColor];
    return <button className={cNameAttributes.join(" ")} onClick={() => this.props.onClick()}/>
  }
}

class RowContents extends React.Component {
  // props: {startCell: ..., endCell: ..., renderCell: ...}
  render() {
    var elts = [];
    for(let i = this.props.startCell; i <= this.props.endCell; i++) {
      elts.push(this.props.renderCell(i));
    }
    return elts;
  }
}

class ResetButton extends React.Component {
  // props: {text: ..., onClick: ...}
  render() {
    return (
      <button className="btn btn-outline-success btn-sm" 
              onClick={() => this.props.onClick()}>
        {this.props.text}
      </button>
    );
  }
}

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cells: this.getNewCellData(this.props.numPairs),
      clickedCellIndices: [],
      score: 0,
      numMatchedCells: 0,
      gameOver: false,
      cellClickProcessing: false
    };
  }

  getNewCellData(numPairs) {
    const allCellData = [];
    const colors = random.sample(this.props.cellColors, numPairs);
    for(let i = 0; i < numPairs; i++) {
      const chosenColor = colors[i];
      allCellData.push({color: chosenColor, hidden: true, matched: false});
      allCellData.push({color: chosenColor, hidden: true, matched: false});
    }
    random.shuffle(allCellData);
    return allCellData;
  };

  handleNewGameClick() {
    // make cell clicks atomic; nothing happens until they are processed
    if(this.state.cellClickProcessing) return;

    this.setState({
      cells: this.getNewCellData(this.props.numPairs),
      clickedCellIndices: [],
      score: 0,
      numMatchedCells: 0,
      gameOver: false,
      cellClickProcessing: false
    });
  }

  handleCellClick(i) {
    // make cell clicks atomic; nothing happens until they are processed
    if(this.state.cellClickProcessing) return;
    
    this.setState({
      cellClickProcessing: true
    });

    if(this.state.clickedCellIndices.length === 0) {
      this.handleFirstClick(i);
    } else {
      this.handleSecondClick(i);
    }
  }

  handleFirstClick(i) {
    const currentCells = this.state.cells.slice();    
    currentCells[i].hidden = false;
    this.setState({
      gameStarted: true,
      clickedCellIndices: [ i ], 
      cells: currentCells,
      cellClickProcessing: false
    });
  }

  handleSecondClick(i) {
    const currentCells = this.state.cells.slice();
    const newCell = currentCells[i];
    const prevIndex = this.state.clickedCellIndices[0];
    const prevCell = currentCells[prevIndex];
    // handle default actions
    newCell.hidden = false;

    // handle score state
    const correctGuess = newCell.color === prevCell.color;
    if(correctGuess) {
      this.handleCorrectGuess(currentCells, prevCell, newCell);
    } else {
      this.handleIncorrectGuess(currentCells, prevCell, newCell);
    }
  }

  handleCorrectGuess(currentCells, prevCell, newCell) {
    const newScore = this.state.score + this.props.correctScoreIncrement;
    const newMatchedCells = this.state.numMatchedCells + 2;
    const gameOver = newMatchedCells === this.props.numCells;
    
    this.setState({
      clickedCellIndices: [],
      score: newScore,
      numMatchedCells: newMatchedCells,
      gameOver: gameOver
    });
    
    setTimeout(() => {
      prevCell.matched = true;
      newCell.matched = true;
      this.setState({
        cells: currentCells,
        cellClickProcessing: false
      });
    }, this.props.timeoutInterval);
  }

  handleIncorrectGuess(currentCells, prevCell, newCell) {
    const newScore = this.state.score + this.props.incorrectScoreIncrement;
    this.setState({
      clickedCellIndices: [],
      score: newScore
    });

    setTimeout(() => {
      newCell.hidden = true;
      prevCell.hidden = true;
      this.setState({
        cells: currentCells,
        cellClickProcessing: false
      });
    }, this.props.timeoutInterval);
  }

  render() {
    var status;
    if(this.state.gameOver) {
      status = (
        <div className="status-container">
          <h2>Game Over!</h2>
          <p className="lead">Final score: {this.state.score}</p>
          <ResetButton text="Play Again" onClick={() => this.handleNewGameClick()} />
        </div>
      );
    } else {
      status = (
        <div className="status-container">
          <p className="lead">Score: {this.state.score}</p>
          <ResetButton text="Restart" onClick={() => this.handleNewGameClick()} />
        </div>
      )
    }

    return (
      <div className="container">
        <h1>
          <span role="img" aria-label="men holding hands">👬</span>
          Matching Pairs
          <span role="img" aria-label="women holding hands">👭</span>
        </h1>

        { status }

        <div className="grid-container">
          { this.renderRow(0, 3) }
          { this.renderRow(4, 7) }
          { this.renderRow(8, 11) }
          { this.renderRow(12, 15) }
        </div>
      </div>
    );
  }

  renderRow(startCell, endCell) {
    return (
      <div className="board-row">
        <RowContents startCell={startCell}
                     endCell={endCell}
                     renderCell={(i) => this.renderCell(i)} />
      </div>
    );
  }

  renderCell(i) {
    const cellData = this.state.cells[i];
    return <Cell color={cellData.color} 
                 hidden={cellData.hidden} 
                 matched={cellData.matched}
                 onClick={() => this.handleCellClick(i)} />;
  }

}

class App extends React.Component {
  render() {
    return (
      <div className="app-container text-center">
        <Grid cellColors={CELL_COLORS} 
              numPairs={NUM_PAIRS} 
              numCells={NUM_PAIRS * 2}
              correctScoreIncrement={MATCH_SCORE_INCREMENT} 
              incorrectScoreIncrement={ERROR_SCORE_INCREMENT}
              timeoutInterval={TIMEOUT_INTERVAL} />
      </div>
    )
  }
}

export default App;