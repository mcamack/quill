import React from 'react';
import Workspace from './Workspace';
import AccordionList from './AccordionList';
import GraphVisualization  from './GraphViz';

function App() {
  return (
    <div className="app">
      <main>
        <div>
          {/* <Workspace />
          <AccordionList /> */}
          <GraphVisualization  />
        </div>
      </main>
    </div>
  );
}

export default App;