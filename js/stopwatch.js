function StopwatchUI(startPoint = null) {
    oLogger.log('Start of constructor<StopwatchUI>');

    const   SW_IDLE = 0,
            SW_START = 1,
            SW_PAUSE = 2,
            SW_CONTINUE = 3,
            SW_CLEAR = 4;

    if(!startPoint) {
        oLogger.log('the Stopwatch UserInterface has not been initialized !');

        oLogger.log('End of constructor<StopwatchUI>');
        return;
    }

    // UI Controls corresponding to Watchstop-dimensions
    let hhEl = startPoint.querySelector( '.scoreboard .stopwatch-hours' );
    let mmEl = startPoint.querySelector( '.scoreboard .stopwatch-minutes' );
    let ssEl = startPoint.querySelector( '.scoreboard .stopwatch-seconds' );
    let msEl = startPoint.querySelector( '.scoreboard .stopwatch-milliseconds' );

    let controlStart = startPoint.querySelector( '[data-control-start]' );
    let controlClear = startPoint.querySelector( '[data-control-clear]' );



    function setTxtValue(element, txtValue) {
        element.textContent = txtValue;
    }

    /*  Fill in digit-cells of Scoreboard like { HH, MM, SS, ms }

        P.S. Not too progressive-solution at the moment
        Use array where <index = valueLength>, <Item = string literal '0..00'>
    */
    function setSWDigit(element, intValue, digitWidth) {
        let digitZeroPrefix = '';
        let intString = intValue.toString();
        // let valueLength = intString.length;
        let zeroPadLength = digitWidth - intString.length;

        // Ver 01 : computation
        // for(let cntr = 0; cntr < zeroPadLength; cntr++) {
        //     digitZeroPrefix += '0';
        // }
        // let textValue = digitZeroPrefix + intString;

        // Ver 02 : a value from the array
        let zeroPadVec = [ '', '0', '00', '000', '0000', '00000' ];
        let textValue = zeroPadVec[ zeroPadLength ] + intString;


        element.textContent = textValue;
    }

    //  Public section ...

    this.getControlStart = function() {
        return controlStart;
    };

    this.getControlClear = function() {
        return controlClear;
    };


    this.getSWUI = function() {
        return {
            hhEl : this.hhEl,
            mmEl : this.mmEl,
            ssEl : this.ssEl,
            msEl : this.msEl,
        };
    };

    this.resetScoreBoard = function(hh, mm, ss, ms) {

        setSWDigit( hhEl, hh, 2 );
        setSWDigit( mmEl, mm, 2 );
        setSWDigit( ssEl, ss, 2 );
        setSWDigit( msEl, ms, 3 );

    };

    this.refreshScoreBoard = function(hh, mm, ss, ms) {
        setSWDigit( hhEl, hh, 2 );
        setSWDigit( mmEl, mm, 2 );
        setSWDigit( ssEl, ss, 2 );
        setSWDigit( msEl, ms, 3 );
    };

    this.changeStartUI = function(controlPhase) {
        // A new state to switch to
        switch(controlPhase) {
            case SW_START:
                controlStart.classList.remove( 'control__start' );
                // Show next possible state of the Start-control
                setTxtValue( controlStart, 'pause' );
                controlStart.classList.add( 'control__pause' );
                break;

            case SW_PAUSE:
                // next possible phase is <Continue>
                controlStart.classList.remove( 'control__pause' );
                // Show next possible state of the Start-control
                setTxtValue( controlStart, 'continue' );
                controlStart.classList.toggle( 'control__continue' );
                break;

            case SW_CONTINUE:
                // next possible phase is <Pause>
                controlStart.classList.remove( 'control__continue' );
                // Show next possible state of the Start-control
                setTxtValue( controlStart, 'pause' );
                controlStart.classList.add( 'control__pause' );
                break;

            case SW_CLEAR:
                controlStart.classList.remove( 'control__pause' );
                controlStart.classList.remove( 'control__continue' );
                setTxtValue( controlStart, 'start' );
                controlStart.classList.add( 'control__start' );
                break;

        }

        return true;
    };

    StopwatchUI.prototype.toString = function () {
      return ' :: StopwatchUI <' + '' + '>';
    };
    // eof public Functions


    oLogger.log('End of constructor<StopwatchUI>');
}

function Stopwatch(swUIObj = null) {
    oLogger.log('Start of constructor<Stopwatch>');

    const   SW_IDLE = 0,
            SW_START = 1,
            SW_PAUSE = 2,
            SW_CONTINUE = 3,
            SW_CLEAR = 4;

    /* The period of the SW's Scoreboard REFRESH in milliseconds :
        LOW = 1000ms, i.e. 1sec
        MIDDLE = 500ms, i.e. 0.5sec
        HIGH = 200ms, i.e. 0.2sec
    */
    const   SW_SCOREBOARD_REFRESH_LOW = 1000,
            SW_SCOREBOARD_REFRESH_MIDDLE = 500,
            SW_SCOREBOARD_REFRESH_HIGH = 200;

    // Stopwatch Values measured at the moment
    let swBody = {
        // momentInTime { hh, mm, ss, ms }
        hh : 0,
        mm : 0,
        ss : 0,
        ms : 0,

        //
        timeMomentStart : null,
        timeMomentCurrent : null,
        timeDuration : null,
        // { Idle || null||initial, Start, Pause, Continue, Clear }
        swState : null,

        refreshTimerId : null,
    };

    let controlStart = swUIObj.getControlStart();
    // var handlerOwner = this;
    controlStart.addEventListener( 'click', runStart.bind(this) );

    let controlClear = swUIObj.getControlClear();
    controlClear.addEventListener( 'click', runClear.bind(this) );


    /*
            Method : Initilization of StopWatch Ticks
    */
    function initSW() {
        oLogger.log('Start of <initSW>');

        swBody.hh = swBody.mm = swBody.ss = swBody.ms = 0;

        swBody.timeMomentStart = 0;
        swBody.timeMomentCurrent = 0;

        swUIObj.resetScoreBoard( 0, 0, 0, 0 );

        swBody.swState = SW_IDLE;

        oLogger.log('End of <initSW>');
        return true;
    }

    // test
    // this.initStopwatch = function () {
    //     initSW();
    // };


    /* Start-control Phases
        { Start, Pause, Continue }
    */
    function runStart(event) {
        oLogger.log('Start of <runStart>');

        // Latter state
        switch(swBody.swState) {
            case SW_IDLE:
                runStartPhase();
                // New state is Start
                swBody.swState = SW_START;
                break;
            case SW_START:
                runPausePhase();
                // New state is Pause
                swBody.swState = SW_PAUSE;
                break;
            case SW_PAUSE:
                runContinuePhase();
                // New state is Continue
                swBody.swState = SW_CONTINUE;
                break;
            case SW_CONTINUE:
                runPausePhase();
                // New state is Pause
                swBody.swState = SW_PAUSE;
                break;

        }

        // console.log("We are inside of runStart");
        oLogger.log('End of <runStart>');
    }

    function runStartPhase() {
        oLogger.log('Start of <runStartPhase>');

        // Set next possible state of the Start control
        swUIObj.changeStartUI( SW_START );

        // Miiliseconds live here to work faster ...
        swBody.timeMomentStart = Date.now();

        // swBody.refreshTimerId = setInterval(showStopWatch.bind(this), SW_SCOREBOARD_REFRESH_HIGH);
        // swBody.refreshTimerId = setInterval(showStopWatch.bind(this), SW_SCOREBOARD_REFRESH_MIDDLE);
        swBody.refreshTimerId = setInterval(showStopWatch.bind(this), SW_SCOREBOARD_REFRESH_LOW);

        oLogger.log('End of <runStartPhase>');
    }

    function runPausePhase() {
        oLogger.log('Start of <runPausePhase>');

        swUIObj.changeStartUI( SW_PAUSE );

        clearInterval( swBody.refreshTimerId );

        oLogger.log( 'End of <runPausePhase>' );
    }

    function runContinuePhase() {
        oLogger.log('Start of <runContinuePhase>');

        // Set next possible state of the Start control
        swUIObj.changeStartUI( SW_CONTINUE );

        // Miiliseconds live here to work faster ...
        swBody.timeMomentStart += Date.now() - swBody.timeMomentCurrent;

        // swBody.refreshTimerId = setInterval(showStopWatch.bind(this), SW_SCOREBOARD_REFRESH_HIGH);
        // swBody.refreshTimerId = setInterval(showStopWatch.bind(this), SW_SCOREBOARD_REFRESH_MIDDLE);
        swBody.refreshTimerId = setInterval(showStopWatch.bind(this), SW_SCOREBOARD_REFRESH_LOW);

        oLogger.log('End of <runContinuePhase>');
    }



    function runClear(event) {
        oLogger.log('Start of <runClear>');



        clearInterval( swBody.refreshTimerId );

        initSW();
        swUIObj.changeStartUI( SW_CLEAR );

        swBody.swState = SW_IDLE;

        // console.log("We are inside of runClear");
        oLogger.log('End of <runClear>');
    }

    /*  Show the Stopwatch values { HH, MM, SS, ms }
    */
    function showStopWatch() {
        // Miiliseconds live here to work faster ...
        // swBody.timeMomentCurrent = Date.now();
        swBody.timeMomentCurrent = Date.now();

        /* a time shift on Time axes in milliseconds with respect
            to the Start Point of Stopwatch
        */
        let timeShift = swBody.timeMomentCurrent - swBody.timeMomentStart;

        swBody.timeDuration.setTime( timeShift );

        swBody.hh = swBody.timeDuration.getUTCHours();
        swBody.mm = swBody.timeDuration.getUTCMinutes();
        swBody.ss = swBody.timeDuration.getUTCSeconds();
        swBody.ms = swBody.timeDuration.getUTCMilliseconds();


        swUIObj.refreshScoreBoard( swBody.hh, swBody.mm, swBody.ss, swBody.ms );
    }


//  Public section ...

    this.attachSWUI = function(swUIObject) {
        swUIObj = swUIObject;

        oLogger.log('swUIObj = swUIObject <' + swUIObj + '>');
    };

    Stopwatch.prototype.toString = function () {
      return ' :: Stopwatch <' + '' + '>';
    };

// eof publicFunction01

    if(!swUIObj) {
        oLogger.log('the Stopwatch UserInterface has not been attached !' +
            '\nUse attachSWUI() public method to atach one !');
    }

    initSW();
    // one runtime Date-instance creation
    swBody.timeDuration = new Date();

    oLogger.log('End of of constructor<Stopwatch>');
}


let stopwatchUIObj = new StopwatchUI( document.querySelectorAll('.wrapper-stopwatch')[0] );
// test
// let stopwatchObj  = new Stopwatch();
let stopwatchObj  = new Stopwatch( stopwatchUIObj );

console.log('Press, please, Start-button');
// alert('Press, please, Start-button');

// test
// stopwatchObj.attachSWUI(stopwatchUIObj);

// test
// stopwatchObj.initStopwatch();
