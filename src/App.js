import React, { useRef, useState, useEffect } from "react";

import paper from "./paper.png";
import rock from "./rock.png";
import scissors from "./scissor.png";
import * as fp from "fingerpose";

import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

var hand;

const rockgest = new fp.GestureDescription("rock");
rockgest.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
rockgest.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
rockgest.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
rockgest.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
rockgest.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);

const papergest = new fp.GestureDescription("paper");
papergest.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
papergest.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
papergest.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
papergest.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
papergest.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);

const scissorsgest = new fp.GestureDescription("scissors");
scissorsgest.addCurl(fp.Finger.Thumb, fp.FingerCurl.FullCurl, 1.0);
scissorsgest.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
scissorsgest.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
scissorsgest.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
scissorsgest.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [gest, setGest] = useState(null);
  const [baraks, setbaraks] = useState(null);
  const images = { rock: rock, paper: paper, scissors: scissors };

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      hand = await net.estimateHands(video);

      if (hand.length > 0) {
        document.getElementById("Confidence").innerText =
          hand[0].handInViewConfidence.toFixed(5);
      }

      // Gesture
      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([scissorsgest, papergest, rockgest]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          let tempak = gesture.gestures[maxConfidence].name;
          setGest(tempak);

          if (tempak == "rock") {
            setbaraks("paper");
          } else if (tempak == "paper") {
            setbaraks("scissors");
          } else if (tempak == "scissors") {
            setbaraks("rock");
          }

          if (tempak !== null) {
            document.getElementById("apphand").style.border =
              "thick solid green";
            window.setTimeout(
              () =>
                (document.getElementById("apphand").style.border =
                  "thick solid white"),
              3000
            );
          }

          //  console.log(tempak);
          // console.log(`final gest is: ${gest}`);
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <div className="container">
      <div className="row">
      <nav>
    <div class="nav-wrapper">
      <a href="#" class="brand-logo">Rock, Paper, Cheater</a>
      {/* <ul id="nav-mobile" class="right hide-on-med-and-down">
        <li><a href="sass.html">Sass</a></li>
        <li><a href="badges.html">Components</a></li>
        <li><a href="collapsible.html">JavaScript</a></li>
      </ul> */}
    </div>
  </nav>
        </div>
        
        <div className="row">
          <div className="col s6">
            <Webcam
              ref={webcamRef}
              style={{
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",

                top: 100,
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480,
              }}
            />
          </div>
          <div className="col s6 infobox bigtar">
            
            <div class="chip">
    
            Confidence
  </div>
  <br />
            
            <span className="infow" id="Confidence">0</span>
            <br />
            
            <div class="chip">
    
            Estimated gesture
  </div>
  <br />
            <span className="infow">{gest}</span>
          </div>
          <br />
        </div>
        <div className="row">
          <div className="col s4 bigtar vasat bigtarrr">
            Player
            <br />
            <img key={Date.now()} src={gest ? images[gest] : ""}></img>
          </div>

          <div className="col s4 bigtarr vasat">vs.</div>
          <div id="apphand" className="col s4 bigtar vasat bigtarrr">
            App
            <br />
            <img key={Date.now()} src={baraks ? images[baraks] : ""}></img>
          </div>
        </div>
        <footer class="page-footer">
          
        <div class="footer-copyright">
            <div class="container">
            © 2020 behance.net/sahandbabali
            <a class="grey-text text-lighten-4 right" href="#!">github.com/sahandbabali</a>
            </div>
          </div>
          </footer>
      </div>
    </div>
  );
}

export default App;
