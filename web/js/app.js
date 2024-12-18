(async (window, document, undefined) =>{
  function uuidv4() { return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
  const client_id = uuidv4();

  async function loadWorkflow(){
    const res = await fetch('/pecs/js/workflow_api.json')
    return await res.json()
  }
  const workflow = await loadWorkflow()

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const server_address = window.location.hostname + ':' + window.location.port
  const socket = new WebSocket(`${protocol}://${server_address}/ws?clientId=${client_id}`);
  socket.addEventListener('open',(event) => {
    console.log('connected to the server')
  })

  const _maingen = document.getElementById('maingen')
  socket.addEventListener('message', (event)=> {
    console.log("Event Data:", event.data)
    const data = JSON.parse(event.data)
    console.log("Json Parsed Data:", data)
    if (data.type === 'executed') {
      if ('images' in data['data']['output']) {
        const image = data['data']['output']['images'][0]
        const filename = image['filename']
        const subfolder = image['subfolder']
        const rand = Math.random()

        _maingen.src = '/view?filename=' + filename
          //+ '&type=ouput&subfolder=' + subfolder + '&rand=' + rand
      }
    }
  })

  async function queuePrompt(prompt = {}){
    const data = {'prompt': prompt, 'client_id': client_id}
    const response = await fetch('/prompt', {
      method:'POST',
      cache:'no-cache',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify(data)
    })
    console.log("Fetch Response", response)
  }

  async function draw() {
    // Wait for all images to be loaded.
    await Promise.all(
      Array.from(document.images).map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete){
              resolve()
            } else {
              image.addEventListener("load", resolve)
            }
          })
      ),
    );
  
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
  
    ctx.drawImage(
      document.getElementById("maingen"),0,0);
  
    ctx.strokeStyle = "white"
    ctx.lineWidth = 102
    ctx.strokeRect(1,1, 1024, 1024)
  
    ctx.lineWidth = 200;
    ctx.strokeStyle = "white";
    ctx.moveTo(0, 950);
    ctx.lineTo(1024, 950);
    ctx.stroke();
    
    var name = document.getElementById("card_name").value
    ctx.font = "50px Arial";
    ctx.fillText(name,150,950, 750);
  }
  document.getElementById('redraw_canv')?.addEventListener('click', draw);

  async function sendPrompt(){
    const prompt = document.getElementById('promptArea').value
    //workflow text
    workflow[3]['inputs']['text'] = prompt 
    //workflow seed
    workflow[2]['inputs']['noise_seed'] = Math.floor(Math.random() * 9999999999)

    console.log('Loaded workflow:', workflow);
    await queuePrompt(workflow)
    await draw()
  }
  document.getElementById('sendButton')?.addEventListener('click', sendPrompt);

})(window, document, undefined)
//checkpoin
