ReactDOM.render(<App />, document.getElementById("root"));

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel,
  };
};

function App() {
  return (
    <div id="app">
      <Clock />
    </div>
  );
}

function Clock() {
  const DEFAULT_BREAK_LENGTH = 5;
  const DEFAULT_SESSION_LENGTH = 25;

  const [started, setStarted] = React.useState(false);

  const [breakLength, setBreakLength] = React.useState(DEFAULT_BREAK_LENGTH);
  const [sessionLength, setSessionLength] = React.useState(
    DEFAULT_SESSION_LENGTH
  );
  const [activeClock, setActiveClock] = React.useState("S");
  const [reset, setReset] = React.useState(0);

  return (
    <div className="clock">
      <div className="title">25 + 5 Clock</div>
      <div className="length-setters">
        <LengthSetter
          type="break"
          disabled={started}
          label="Break Length"
          length={breakLength}
          setter={setBreakLength}
        />
        <LengthSetter
          type="session"
          disabled={started}
          label="Session Length"
          length={sessionLength}
          setter={setSessionLength}
        />
      </div>
      <Display
        {...{
          started,
          reset,
          activeClock,
          setActiveClock,
          breakLength,
          sessionLength,
        }}
      />
      <Controls {...{ setStarted, onReset: handleReset }} />
      <p></p>
      <div className="design">Designed and Coded by</div>
      <div className="author">Shlomi Yahbes</div>
    </div>
  );
  function handleReset() {
    setBreakLength(DEFAULT_BREAK_LENGTH);
    setSessionLength(DEFAULT_SESSION_LENGTH);
    setActiveClock("S");
    setReset(reset + 1);
    setStarted(false);
  }
}

function LengthSetter({ type, label, length, setter, disabled }) {
  const labelId = type + "-label";
  const decrementId = type + "-decrement";
  const incrementId = type + "-increment";
  const lengthId = type + "-length";

  return (
    <div className="length-setter">
      <div id={labelId} className="label">
        {label}
      </div>
      <button id={decrementId} onClick={decrement}>
        <i className="fa fa-arrow-down fa-2x"></i>
      </button>
      <span id={lengthId}>{length}</span>
      <button id={incrementId} onClick={increment}>
        <i className="fa fa-arrow-up fa-2x"></i>
      </button>
    </div>
  );
  function decrement() {
    if (disabled) {
      return;
    }
    if (length > 1) {
      setter(length - 1);
    }
  }
  function increment() {
    if (disabled) {
      return;
    }
    if (length < 60) {
      setter(length + 1);
    }
  }
}

function Display({
  started,
  reset,
  activeClock,
  setActiveClock,
  sessionLength,
  breakLength,
}) {
  const audioRef = React.useRef();

  const [timer, setTimer] = React.useState(
    (activeClock === "S" ? sessionLength : breakLength) * 60
  );

  React.useEffect(() => {
    if (started) {
      const interval = accurateInterval(countDown, 1000);
      return function cleanup() {
        interval.cancel();
      };
    }
  }, [started]);

  React.useEffect(() => {
    setTimer(sessionLength * 60);
  }, [sessionLength]);

  React.useEffect(() => {
    setTimer((activeClock === "S" ? sessionLength : breakLength) * 60);
  }, [activeClock]);

  React.useEffect(() => {
    const audioEl = audioRef.current;
    audioEl.pause();
    audioEl.currentTime = 0;
  }, [reset]);

  return (
    <div className={classNames("display", { imminent: timer < 60 })}>
      <div id="timer-label">{activeClock === "S" ? "Session" : "Break"}</div>
      <div id="time-left" className="time-left">
        {clockify()}
      </div>
      <audio
        id="beep"
        preload="auto"
        ref={audioRef}
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      />
    </div>
  );

  function countDown() {
    setTimer((prevTimer) => {
      if (prevTimer > 0) {
        return prevTimer - 1;
      } else if (prevTimer === 0) {
        setActiveClock((ac) => (ac === "S" ? "B" : "S"));
        const audioEl = audioRef.current;
        audioEl.play();

        return prevTimer;
      } else {
        throw Error(`Timer ${prevTimer} should not happen`);
      }
    });
  }

  function clockify() {
    const SECONDS_IN_MINUT = 60;
    let minutes = Math.floor(timer / SECONDS_IN_MINUT);
    let seconds = timer - minutes * SECONDS_IN_MINUT;

    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
    return minutes + ":" + seconds;
  }
}

function Controls({ setStarted, onReset }) {
  return (
    <div className="controls">
      <button id="start_stop" className="start-stop" onClick={handleStartStop}>
        <i className="fa fa-play fa-2x"></i>
        <i className="fa fa-pause fa-2x"></i>
      </button>
      <button id="reset" className="reset" onClick={onReset}>
        <i className="fa fa-refresh fa-2x"></i>
      </button>
    </div>
  );

  function handleStartStop() {
    setStarted((started) => !started);
  }
}
