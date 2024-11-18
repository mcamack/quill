import React from 'react';
import Workspace from './Workspace';
import AccordionList from './AccordionList';

function App() {
  return (
    <div className="app">
      <main>
        <div>
          <Workspace />
          <AccordionList />
        </div>
      </main>
    </div>
  );
}

export default App;