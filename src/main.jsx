// Code needs to be refactored, but still pretty readable

import React from 'react';
import ReactDOM from 'react-dom';
import MainView from './MainView';
import ZodiacStrip from './ZodiacStrip';
import {RangeStepInput} from 'react-range-step-input';
import {forceNumber, radToDeg, degToRad} from './utils';
import { maxHeaderSize } from 'http';

class PlanetaryConfigSim extends React.Component {
	constructor(props) {
		super(props);
		this.initialState = {
		    observerPlanetAngle: 0,
		    targetPlanetAngle: 0,
		    radiusTargetPlanet: 300,
		    radiusObserverPlanet: 160,
		    // This multiplier is for the orbital equation: https://tinyurl.com/yx444bnv
		    // Use the ratio between the radius of the two planets to find this multiplier
		    multiplier:  Math.pow((160 / 300), 1.5),
		    isPlaying: false,
		    animationRate: 0.5,
		};

		this.state = this.initialState;
		this.raf = null;

		this.stopAnimation = this.stopAnimation.bind(this);
	}

    render() {
        let startBtnText = 'Play animation';
        if (this.state.isPlaying) {
            startBtnText = 'Pause Animation';
        }
        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Planetary Configurations Simulator</span>

                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={this.onResetClick.bind(this)}>Reset</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#helpModal">Help</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#aboutModal">About</a>
                    </li>
                </ul>
            </nav>
            <div className="row mt-2">
                <div className="col-8">
                    <MainView
                        observerPlanetAngle={this.state.observerPlanetAngle}
                        targetPlanetAngle={this.state.targetPlanetAngle}
                        radiusTargetPlanet={this.state.radiusTargetPlanet}
                        radiusObserverPlanet={this.state.radiusObserverPlanet}
                        onObserverPlanetAngleUpdate={this.onObserverPlanetAngleUpdate.bind(this)}
                        onTargetPlanetAngleUpdate={this.onTargetPlanetAngleUpdate.bind(this)}
                        stopAnimation={this.stopAnimation}
                    />
                </div>
                    <div className="rowx">
                        <div className="col">
                            <h4>Orbit Sizes</h4>

                            <div className="radObserver">
                                <form className="form-inline">
                                    <label htmlFor="radObserverPlanetRange">Radius of observer planet's orbit</label>
                                    <RangeStepInput name="radiusObserverPlanet"
                                           className="form-control-range ml-2"
                                           value={this.state.radiusObserverPlanet}
                                           onChange={this.onObserverPlanetRadiusChange.bind(this)}
                                           step={10}
                                           min={50} max={500} />
                                </form>
                            </div>
                            
                            <div className="radTarget">
                                <form className="form-inline">
                                    <label htmlFor="radTargetPlanetRange">Radius of target planet's orbit</label>
                                    <RangeStepInput name="radiusTargetPlanet"
                                           className="form-control-range ml-2"
                                           value={this.state.radiusTargetPlanet}
                                           onChange={this.onTargetPlanetRadiusChange.bind(this)}
                                           step={10}
                                           min={50} max={500} />
                                </form>
                            </div>
                        </div>

                        <div className="col">
                            <h4>Animation Control</h4>
                            <button type="button" className="btn btn-primary btn-sm"
                                    onClick={this.onStartClick.bind(this)}>
                                {startBtnText}
                            </button>
                            <form className="form-inline">
                                <label htmlFor="diamRange">Animation rate:</label>
                                <RangeStepInput name="animationRate"
                                       className="form-control-range ml-2"
                                       value={this.state.animationRate}
                                       onChange={this.onAnimationRateChange.bind(this)}
                                       step={0.1}
                                       min={3} max={10} />
                            </form>
                        </div>
                    </div>
		    <div className="bot">
		        <ZodiacStrip
				speed={this.state.animationRate}
				observerPlanetAngle={this.state.observerPlanetAngle}
				targetPlanetAngle={this.state.targetPlanetAngle}
                radiusObserverPlanet={this.state.radiusObserverPlanet}
                radiusTargetPlanet={this.state.radiusTargetPlanet}
				isPlaying={this.state.isPlaying}
                stopAnimation={this.stopAnimation}
		        />
                    </div>
                </div>
        </React.Fragment>;
    }

   incrementObserverPlanetAngle(n, inc) {
        const newAngle = n + inc;
        if (newAngle > Math.PI) {
            return newAngle * -1;
        }
        return newAngle;
    }

    incrementTargetPlanetAngle(n, inc) {
        const newAngle = n + (this.state.multiplier) * inc; 
        if (newAngle > Math.PI) {
            return newAngle * -1;
        }
        return newAngle;
    }
    
    animate() {
        let newMultiplier = Math.pow((this.state.radiusObserverPlanet / this.state.radiusTargetPlanet), 2)
        const me = this;
        this.setState(prevState => ({
            multiplier: newMultiplier,
            observerPlanetAngle: me.incrementObserverPlanetAngle(prevState.observerPlanetAngle, 0.010 * this.state.animationRate),
            targetPlanetAngle: me.incrementTargetPlanetAngle(prevState.targetPlanetAngle, 0.010 * this.state.animationRate)
        }));
        this.raf = requestAnimationFrame(this.animate.bind(this));
    }

    onStartClick() {
        if (!this.state.isPlaying) {
            this.raf = requestAnimationFrame(this.animate.bind(this));
            this.setState({isPlaying: true});
        } else {
            this.stopAnimation();
            this.setState({isPlaying: false});
        }
    }
    
    // Earth
    onObserverPlanetAngleUpdate(newAngle) {
        this.stopAnimation();
        let diff = 0;
        let newAng = newAngle;
        let prevObserverPlanetAng = this.state.observerPlanetAngle;
        

        if (newAng >= (Math.PI / 2) && newAng <= Math.PI && prevObserverPlanetAng >= -Math.PI 
        && prevObserverPlanetAng <= (-Math.PI / 2)) {
            diff = -(Math.abs(newAng - Math.PI) + Math.abs(-Math.PI - prevObserverPlanetAng));
        } else if (prevObserverPlanetAng >= (Math.PI / 2) && prevObserverPlanetAng <= Math.PI 
        && newAng >= -Math.PI && newAng <= (-Math.PI / 2)) {
            diff = (Math.abs(prevObserverPlanetAng - Math.PI) + Math.abs(-Math.PI - newAng));
        } else {
            diff = newAng - this.state.observerPlanetAngle;
        }

        diff *= this.state.multiplier;
        let newTargetPlanet = (this.state.targetPlanetAngle + diff); 
        if (newTargetPlanet >= Math.PI) {
            newTargetPlanet = -Math.PI;
        } else if (newTargetPlanet <= -Math.PI) {
            newTargetPlanet = Math.PI;
        }

        // console.log("prev earth: ", radToDeg(this.state.observerPlanetAngle), "new earth: ", radToDeg(newAngle),
        //              "prev mars: ", radToDeg(this.state.targetPlanetAngle), "new mars: ", radToDeg(newTargetPlanet)
        // );

        let newMultiplier = Math.pow((this.state.radiusObserverPlanet / this.state.radiusTargetPlanet), 2)

        this.setState({
            multiplier: newMultiplier,
            isPlaying: false,
            observerPlanetAngle: newAngle,
            targetPlanetAngle: newTargetPlanet
        });
    }

    onTargetPlanetAngleUpdate(newAngle) {
        this.stopAnimation();
        let diff = 0;
        let newAng = newAngle;
        let prevObserverPlanetAng = this.state.targetPlanetAngle;

        if (newAng >= (Math.PI / 2) && newAng <= Math.PI && prevObserverPlanetAng >= -Math.PI
         && prevObserverPlanetAng <= (-Math.PI / 2)) {
            diff = -(Math.abs(newAng - Math.PI) + Math.abs(-Math.PI - prevObserverPlanetAng));
        } else if (prevObserverPlanetAng >= (Math.PI / 2) && prevObserverPlanetAng <= Math.PI
         && newAng >= -Math.PI && newAng <= (-Math.PI / 2)) {
            diff = (Math.abs(prevObserverPlanetAng - Math.PI) + Math.abs(-Math.PI - newAng));
        } else {
            diff = newAng - this.state.targetPlanetAngle;
        }
        

       diff *= (1 / this.state.multiplier);
       let newObserverPlanet = (this.state.observerPlanetAngle + diff); 
        if (newObserverPlanet >= Math.PI) {
            newObserverPlanet = -Math.PI;
        } else if (newObserverPlanet <= -Math.PI) {
            newObserverPlanet = Math.PI;
        }
        // console.log("prev earth: ", radToDeg(this.state.observerPlanetAngle), "new earth: ", radToDeg(newObserverPlanet),
        //              "prev mars: ", radToDeg(this.state.targetPlanetAngle), "new mars: ", radToDeg(newAngle)
        // );

        let newMultiplier = Math.pow((this.state.radiusObserverPlanet / this.state.radiusTargetPlanet), 2)
       this.setState({
            multiplier: newMultiplier,
            isPlaying: false,
            targetPlanetAngle: newAngle,
            observerPlanetAngle: newObserverPlanet
        });
    }

    onAnimationRateChange(e) {
        this.setState({
            animationRate: forceNumber(e.target.value)
        });
    }

    // THIS IS WHERE THE CODE FOR MAKING THE OUTER RADIUS CONSTANT GOES
    onObserverPlanetRadiusChange(e) {
        this.setState({
            radiusObserverPlanet: forceNumber(e.target.value),
        });
    }

    // THIS IS WHERE THE CODE FOR MAKING THE OUTER RADIUS CONSTANT GOES
    onTargetPlanetRadiusChange(e) {
        this.setState({
            radiusTargetPlanet: forceNumber(e.target.value)
        });
    }

    stopAnimation() {
        cancelAnimationFrame(this.raf);
    }
    onResetClick(e) {
        e.preventDefault();
        this.stopAnimation();
        this.setState(this.initialState);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<PlanetaryConfigSim />, domContainer);
