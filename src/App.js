//import { BrowserRouter, Route } from 'react-router-dom';
import React, { useState } from "react";
import { Header } from './components/header';
import { Footer } from './components/footer';
import { puzzleList } from './puzzleList';
import { puzzleIndexMap } from './puzzleList';

function App() {
  let puzzle = [];
  const [answer, setAnswer] = useState("");

  //パズルのテンプレートを読み込む
  function loadTemp(id, scale) {
    //画像を読み込んでImageオブジェクトを作成する
    let radioButtonsForTempColor = document.getElementsByName('tempColor');
    let lengthOfRadioButtons = radioButtonsForTempColor.length;
    let tempColor = '';

    for (let i = 0; i < lengthOfRadioButtons; i++) {
      if (radioButtonsForTempColor.item(i).checked) {
        tempColor = radioButtonsForTempColor.item(i).value;//選択されている色を取得する
      }
    }

    let tempImage = new Image();
    tempImage.src = `assets/img/template_${tempColor}.jpg`;
    tempImage.onload = (function () {
      //画像ロードが完了してからキャンバスの準備をする
      let canvas = document.getElementById(id);
      let ctx = canvas.getContext('2d');

      //キャンバス自体のサイズを設定する
      canvas.width = tempImage.width;
      canvas.height = tempImage.height;

      //実際に表示されるキャンバスのサイズを指定する
      canvas.style.width = Math.min(window.innerWidth * 0.9, 400) * scale + "px";
      canvas.style.height = Math.min(window.innerWidth * 0.9, 400) * scale + "px";


      //キャンバスに画像を描画（開始位置0,0）
      ctx.drawImage(tempImage, 0, 0);

    });
  }

  //１つの整数をランダムに作る
  function randNum(max) {
    return Math.floor(Math.random() * max);
  }

  //重複しない２つの数をランダムに作る
  function twoRandNum(max) {
    let rand1 = Math.floor(Math.random() * max);
    let rand2 = Math.floor(Math.random() * max);
    while (rand1 === rand2) {
      rand2 = Math.floor(Math.random() * max);
    }
    return [rand1, rand2];
  }

  //パズルを生成（できるかどうかをチェック）
  function createPuzzle(canvas_id, answer) {
    if (puzzleIndexMap.has(answer)) {//ユーザーが入力した答えが登録されているとき
      let puzzlePieces = puzzleList[puzzleIndexMap.get(answer)];
      let leftAndLeftUp = [];
      let leftDown = [];
      let rightAndRightDown = [];
      let rightUp = [];

      for (let i = 1; i < puzzlePieces.length; i++) {
        let hint = puzzlePieces[i];
        if (hint.includes(answer[0])) {
          if (answer[0] === hint[0]) {
            leftDown.push(hint);
          } else {
            leftAndLeftUp.push(hint);
          }
        } else {
          if (answer[1] === hint[1]) {
            rightUp.push(hint);
          } else {
            rightAndRightDown.push(hint);
          }
        }
      }

      if ((leftAndLeftUp.length >= 2) && (rightAndRightDown.length >= 2) && (rightUp.length > 0) && (leftDown.length > 0)) {
        let randL = twoRandNum(leftAndLeftUp.length);
        let randR = twoRandNum(rightAndRightDown.length);
        let puzzle = [
          answer,
          leftAndLeftUp[randL[0]][0],
          leftAndLeftUp[randL[1]][0],
          rightUp[randNum(rightUp.length)][0],
          rightAndRightDown[randR[0]][1],
          rightAndRightDown[randR[1]][1],
          leftDown[randNum(leftDown.length)][1]
        ];

        return puzzle;
      }
    }
    return false;

  }


  //パズルのヒントを書き込む
  function drawHint(canvas_id) {
    let canvas = document.getElementById(canvas_id);
    let ctx = canvas.getContext('2d');
    let posi = [[135, 1610], [930, 830], [1750, 830], [2545, 1610], [1750, 2400], [930, 2400]]

    ctx.font = '320px ZenMaruGothicRegular'; //文字のスタイルを指定
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 6; i++) {
      ctx.fillText(puzzle[i + 1], posi[i][0], posi[i][1]);
    }

  }

  //パズルの答えを書きこむ
  function drawAns(canvas_id) {
    let canvas = document.getElementById(canvas_id);
    let ctx = canvas.getContext('2d');
    let posi = [[840, 1690], [1645, 1690]]

    ctx.font = '500px ZenMaruGothicRegular'; //文字のスタイルを指定
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 2; i++) {
      ctx.fillText(puzzle[0][i], posi[i][0], posi[i][1]);
    }

  }

  //キャンバスをクリアする
  function clearCanvas(id) {
    let canvas = document.getElementById(id);
    canvas.width = "0px";
    canvas.height = "0px";
  }

  //パズル作成＆出力
  function createPuzzleProcess() {
    puzzle = createPuzzle('puzzleCanvas', answer);
    if (puzzle !== false) {
      const promise = new Promise(function (resolve, reject) {
        loadTemp("puzzleCanvas", 1);
        loadTemp("answerCanvas", 0.7);
        setTimeout(() => resolve(), 3);
      });

      promise.then(function () {
        document.getElementById('createResult').innerText = `「${answer}」が答えになるパズルを生成しました！`;
        document.getElementById('note').innerText = `画像が出ない時は、もう一度「生成」を押してね`;
        drawHint('puzzleCanvas');
        drawHint('answerCanvas');
        drawAns('answerCanvas');

      });
    } else {
      clearCanvas('puzzleCanvas');
      clearCanvas('answerCanvas');
      document.getElementById('createResult').innerText = `「${answer}」が答えになるパズルを生成できませんでした`;
      document.getElementById('note').innerText = ``;


    }

  }

  //input fieldでユーザーがEnterを押したときにもパズル作成が実行されるように
  function enter(e) {
    if (e === 13) {
      createPuzzleProcess();
    }
    return false;
  }

  //生成したパズルの色を変更
  function colorChange(){
    if(puzzle !== false){
      const promise = new Promise(function (resolve, reject) {
        loadTemp("puzzleCanvas", 1);
        loadTemp("answerCanvas", 0.7);
        setTimeout(() => resolve(), 5);
      });

      promise.then(function () {
        drawHint('puzzleCanvas');
        drawHint('answerCanvas');
        drawAns('answerCanvas');

      });
    }

    
  }

  return (
    <div className='bg-yellow-100 min-h-screen static sp:px-[15px] desktop:px-0 flex flex-col items-center'>
      <Header />
      
      <div className='flex items-center'>
        <input name="答え" type="text" id="answerText" placeholder="漢字２文字で入力" onkeypress={enter(this)}
              className='border border-gray-500 pl-[8px] py-[3px]' value={answer}/>
        <button onClick={createPuzzleProcess()} className='bg-blue-500 text-white py-[4px] px-[10px] ml-[20px] font-bold'> 生成</button>
      </div>

      <div className='my-[30px]'>
        <input type="radio" id="blue" name="tempColor" value={blue} defaultChecked onClick={colorChange()} className='mr-[6px]'/>
        <label htmlFor="blue" className='pr-[20px]'>Blue</label>
        <input type="radio" id="green" name="tempColor" value={green} onClick={colorChange()} className='mr-[6px]'/>
        <label htmlFor="green" className='pr-[20px]'>Green</label>
        <input type="radio" id="orange" name="tempColor" value={orange} onClick={colorChange()} className='mr-[6px]'/>
        <label htmlFor="orange" className='pr-[20px]'>Orange</label>    
        <input type="radio" id="pink" name="tempColor" value={pink} onClick={colorChange()} className='mr-[6px]'/>
        <label htmlFor="pink">Pink</label>
      </div>

      <div id="createResult"></div>
      <p id="note"></p>

      <canvas id="puzzleCanvas"></canvas>
      <canvas id="answerCanvas"></canvas>

      <Footer/>
    </div>
  );
}

export default App;
