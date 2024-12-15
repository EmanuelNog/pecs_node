(async (window, document, undefined) =>{
  function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
  const client_id = uuidv4();

  async function loadWorkflow(){
    const res = await fetch('/pecs/js/workflow_api.json')
    return await res.json()
  }
  const workflow = await loadWorkflow()

  const server_address = window.location.hostname + ':' + window.loation.port
  const socket = new WebSocket('ws://' + server_address + '/ws?clientId=' + client_id)
  socket.addEventListener('open',(event) => {
    console.log('connected to the server')
  })
})(window, document, undefined)
