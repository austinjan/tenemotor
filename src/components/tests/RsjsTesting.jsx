import React, { useState, useEffect, useReducer } from "react";
import { Subject, of } from "rxjs";
import { mergeMap, delay, tap } from "rxjs/operators";

const reducer = (state, action) => {
  switch (action.type) {
    case "REMOVE":
      const copyState = { ...state };
      copyState.jobs.delete(action.payload);
      return copyState;
    case "ADD":
      return { ...state, jobs: state.jobs.add(action.payload) };
    default:
      return state;
  }
};

function getUniqueKey(refSet) {
  const range = [...Array(255).keys()];
  for (let i = 0; i < range.length; ++i) {
    if (refSet.has(range[i])) continue;
    return range[i];
  }
  return 0;
}

export default props => {
  const timeoutQueue = new Subject();
  const [state, dispatch] = useReducer(reducer, { jobs: new Set() });
  const [count, setCount] = useState(1);
  const [val, setValue] = useState("");

  function operation() {
    console.log("compute");
    let sum = 0;
    for (let i = 0; i < count * 100; i++) {
      sum += i;
    }
    return sum;
  }
  useEffect(() => {
    timeoutQueue
      .pipe(
        mergeMap(v => of(v)),
        delay(3000)
      )
      .subscribe(v => {
        dispatch({ type: "REMOVE", payload: v });
      });

    return () => {
      timeoutQueue.unsubscribe();
    };
  }, [dispatch, timeoutQueue]);

  const timeout = key => {
    timeoutQueue.next(key);
  };

  const handleSend = e => {
    e.preventDefault();

    const key = getUniqueKey(state.jobs);
    dispatch({ type: "ADD", payload: key });

    timeout(key);
  };

  const handleReceive = e => {
    e.preventDefault();
  };

  const JobComponent = (
    <div className="ui__row">
      <h4>Jobs</h4>
      {Array.from(state.jobs).map(v => (
        <span key={v}> {v}, </span>
      ))}
    </div>
  );

  return (
    <div>
      <h2>RxJS testing</h2>
      <button onClick={handleSend}>send</button>
      <button onClick={handleReceive}>receive</button>
      <div className="ui__row">{JobComponent}</div>
      <div>
        <h4>
          {count}-{val}-{operation()}
        </h4>
        <div>
          <button onClick={() => setCount(count + 1)}>+c1</button>
          <input value={val} onChange={event => setValue(event.target.value)} />
        </div>
      </div>
    </div>
  );
};
