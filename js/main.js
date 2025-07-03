// main.js
document.addEventListener('DOMContentLoaded', async function() {
  const parser = new AttackIQParser();
  await parser.loadMitreData();
  
  const form = document.getElementById('upload-form');
  form.addEventListener('submit', handleFormSubmit);
  
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const scenarioFile = document.getElementById('scenario').files[0];
    const observableFile = document.getElementById('observable').files[0];
    const outputType = document.querySelector('input[name="output_type"]:checked').value;
    
    if (!scenarioFile || !observableFile) {
      alert('Please select both files');
      return;
    }
    
    try {
      const scenarioText = await readFileAsText(scenarioFile);
      const observableText = await readFileAsText(observableFile);
      
      const scenarioData = parser.parseCSV(scenarioText);
      const observableData = parser.parseCSV(observableText);
      
      let result;
      if (outputType === 'navigator') {
        result = parser.generateNavigatorLayer(scenarioData, observableData);
      } else {
        const jiraGenerator = new JiraTicketGenerator(parser.mitreData);
        result = jiraGenerator.generateTickets(scenarioData, observableData);
      }
      
      downloadJSON(result, outputType === 'navigator' ? 'navigator_layer.json' : 'jira_tickets.json');
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files: ' + error.message);
    }
  }
  
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => resolve(event.target.result);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }
  
  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});