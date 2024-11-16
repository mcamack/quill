import React from 'react';
import Workspace from './Workspace';
import RequirementsAccordion from './RequirementsAccordion';

function App() {
  return (
    <div className="app">
      <main>
        <div>
          <Workspace />
          <RequirementsAccordion />
        </div>
      </main>
    </div>
  );
}

export default App;