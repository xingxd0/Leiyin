/* Identity storytelling is local content, not authentication or a system shell. */
const identityStages = [
  {id:'identity',command:'whoami',pauseAfter:450,lines:[
    {type:'heading',text:'Xudong (Daniel) Xing'},
    {type:'role',text:'Product Design Manager @ TikTok | AI Products, Design Systems, Enterprise UX',tag:'ISTJ'}
  ]},
  {id:'focus',command:'cat /focus/current',pauseAfter:650,lines:[
    {type:'text',text:'I’m exploring how AI changes the way people work—and how design can make that change clearer, more useful, and more human.'},
    {type:'text',text:'My focus: clear interactions, reusable systems, and teams that can grow with the work.'}
  ]},
  {id:'profile',command:'cat /profile/current',pauseAfter:650,lines:[
    {type:'field',label:'ROLE',value:'Product Design Manager'},
    {type:'field',label:'COMPANY',value:'TikTok'},
    {type:'field',label:'TEAM',value:'Operations Platform & Design System'},
    {type:'field',label:'FOCUS',value:'AI Products / Design Systems / Enterprise UX'},
    {type:'field',label:'EXPERIENCE',value:'12+ Years in Product Design & Leadership'},
    {type:'field',label:'LEADERSHIP',value:'10 Designers Across China & US'}
  ]},
  {id:'career',command:'cat /career/history',pauseAfter:1350,lines:[
    {type:'career',label:'2023—NOW',value:'TikTok',detail:'Product Design Manager'},
    {type:'career',label:'2021—2023',value:'Kuaishou',detail:'Design Lead'},
    {type:'career',label:'2019—2021',value:'ByteDance',detail:'Design Lead'},
    {type:'career',label:'2018—2019',value:'ByteDance',detail:'Senior UX Designer'},
    {type:'career',label:'2016—2018',value:'58.com',detail:'Senior Product Designer'},
    {type:'career',label:'2014—2016',value:'Yonyou',detail:'Product Designer'}
  ]},
  {id:'expertise',command:'ls /expertise',pauseAfter:1200,lines:[
    {type:'field',label:'CRAFT',value:'Experience Quality & Design Excellence'},
    {type:'field',label:'SYSTEMS',value:'Scalable Design Systems & Complex Platforms'},
    {type:'field',label:'PEOPLE',value:'Team Leadership, Mentorship & Growth'},
    {type:'field',label:'AI',value:'AI-powered Products & Emerging Experiences'}
  ]},
  {id:'recognition',command:'cat /recognition/highlights',pauseAfter:900,lines:[
    {type:'recognition',text:'MUSE Design Award',detail:'Individual Recognition'},
    {type:'recognition',text:'Red Dot Design Award / iF Design Award',detail:'Selected Team Achievements'},
    {type:'text',text:'11 Design Patents'}
  ]},
  {id:'manifesto',command:'cat /manifesto',pauseAfter:100,lines:[
    {type:'manifesto',text:'Find clarity in complexity.'},
    {type:'manifesto',text:'Build systems that scale.'},
    {type:'manifesto',text:'Give people room to grow.'}
  ]},
  {id:'status',command:'./always-becoming --status',pauseAfter:0,lines:[
    {type:'success',text:'✓ Identity verified'},
    {type:'success',text:'✓ Profile loaded'},
    {type:'success',text:'✓ Guest access granted'},
    {type:'status',text:'STATUS: STILL BECOMING'}
  ]}
];

function createIdentityTerminal(host, {navigate, reducedMotion, timing = {}}) {
  const speed = {typing:28,initial:400,execution:200,stage:250,line:100,heading:220,manifesto:550,success:150,...timing};
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const shell = make('section','identity-shell');
  shell.setAttribute('aria-label','Xudong Xing identity terminal');
  const header = make('header','identity-terminal-header');
  const title = make('span','identity-session','Xudong@always-becoming:~');
  const connected = make('span','identity-connected','● CONNECTED');
  header.append(title,connected);
  const output = make('div','terminal-output');
  output.tabIndex = 0;
  output.setAttribute('role','region');
  output.setAttribute('aria-label','Identity transcript. Scroll to read previous output.');
  const transcript = make('div','identity-transcript');
  transcript.setAttribute('aria-hidden','true');
  const staticCopy = make('div','identity-static-copy');
  staticCopy.textContent = identityStages.map(stage =>
    `${stage.command}\n${stage.lines.map(line =>
      line.label ? `${line.label}: ${line.value}${line.detail ? `, ${line.detail}` : ''}`
        : `${line.text}${line.tag ? ` · ${line.tag}` : ''}${line.detail ? `, ${line.detail}` : ''}${line.type==='status'?'_':''}`
    ).join('\n')}`
  ).join('\n\n');
  output.append(staticCopy,transcript);
  const announcement = make('span','identity-static-copy');
  announcement.setAttribute('role','status');
  const controls = make('div','identity-controls');
  const enter = make('button','identity-enter','[ ENTER WORKSPACE → ]');
  enter.type='button';
  controls.hidden = true;
  enter.hidden = true;
  enter.onclick = () => navigate('todo');
  controls.append(enter);
  const {form, input, syncValue} = globalThis.siteUI.createTerminalInput({
    prompt:'Xudong:~ $', placeholder:'Type help for commands',
    label:'Identity command. Type help for available commands.',
    submitLabel:'Run identity command', id:'commandInput'
  });
  input.name='command';
  const dock = make('div','terminal-input-dock');
  dock.append(form);
  shell.append(header,output,controls,dock,announcement);
  host.append(shell);

  let session = null, destroyed = false, follow = true, scrollRequest = 0, lastScrollTime = 0;
  const setState = state => shell.dataset.state=state;
  function cancelScroll() {
    cancelAnimationFrame(scrollRequest);scrollRequest=0;
  }
  function scrollStep(time) {
    if (destroyed || !follow || !output.isConnected) {scrollRequest=0;return;}
    const target = Math.max(0,output.scrollHeight-output.clientHeight);
    const delta = target-output.scrollTop;
    if (Math.abs(delta)<4) {output.scrollTop=target;scrollRequest=0;return;}
    output.scrollTop += delta*(1-Math.exp(-Math.min(time-lastScrollTime,64)/110));
    lastScrollTime=time;
    scrollRequest=requestAnimationFrame(scrollStep);
  }
  function followOutput() {
    if (!follow) return;
    if (reducedMotion.matches) {output.scrollTop=output.scrollHeight;return;}
    if (!scrollRequest) {lastScrollTime=performance.now();scrollRequest=requestAnimationFrame(scrollStep);}
  }
  const observers = new AbortController();
  const interrupt = () => {follow=false;cancelScroll();};
  ['wheel','touchstart','pointerdown'].forEach(type =>
    output.addEventListener(type,interrupt,{passive:true,signal:observers.signal})
  );
  output.addEventListener('keydown',event=>{
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) interrupt();
  },{signal:observers.signal});
  output.addEventListener('scroll',()=>{
    if (!scrollRequest) follow=output.scrollHeight-output.clientHeight-output.scrollTop<48;
  },{signal:observers.signal});
  const resize = new ResizeObserver(followOutput);
  resize.observe(transcript);resize.observe(output);

  function wait(ms, signal) {
    return new Promise((resolve,reject)=>{
      if (signal.aborted) {reject(signal.reason);return;}
      const deadline=performance.now()+ms;
      let timer;
      const abort = () => {clearTimeout(timer);reject(signal.reason);};
      const tick=()=>{
        // Media change delivery can be deferred; stop within the next animation beat.
        if (reducedMotion.matches) {showAll('completed');return;}
        const remaining=deadline-performance.now();
        if (remaining>0) {timer=setTimeout(tick,Math.min(remaining,100));return;}
        signal.removeEventListener('abort',abort);resolve();
      };
      timer=setTimeout(tick,Math.min(ms,100));
      signal.addEventListener('abort',abort,{once:true});
    });
  }
  function cancelSession() {
    session?.abort();session=null;
    transcript.querySelectorAll('.identity-command-cursor').forEach(node=>node.remove());
  }
  function commandNode(stage) {
    const section=make('section',`identity-stage identity-${stage.id}`);
    section.dataset.stage=stage.id;
    const command=make('p','identity-command');
    command.append(make('span','identity-prompt','Xudong:~ $ '));
    const text=make('span','identity-command-text');
    command.append(text);
    section.append(command);
    transcript.append(section);
    return {section,command,text};
  }
  function lineNode(line, animated) {
    let node;
    if (line.type==='field'||line.type==='career') {
      node=make('div',`identity-field${line.type==='career'?' identity-career-row':''}`);
      node.append(make('span','identity-field-label',line.label));
      const value=make('span','identity-field-value',line.value);
      if (line.detail) value.append(make('span','identity-detail',line.detail));
      node.append(value);
    } else {
      node=make(line.type==='heading'?'h2':'p',`identity-output-line identity-${line.type}`,line.text);
      if (line.tag) node.append(make('span','identity-personality-tag',line.tag));
      if (line.detail) node.append(make('span','identity-detail',line.detail));
      if (line.type==='status') node.append(make('span','identity-final-cursor','_'));
    }
    if (animated) node.classList.add('identity-line-enter');
    return node;
  }
  function complete(state) {
    setState(state);controls.hidden=false;enter.hidden=false;
    announcement.textContent='Identity introduction complete. Enter workspace is available.';
    followOutput();
  }
  function showAll(state='skipped') {
    if (destroyed) return;
    cancelSession();cancelScroll();
    transcript.replaceChildren();
    identityStages.forEach(stage=>{
      const {section,text}=commandNode(stage);
      text.textContent=stage.command;
      stage.lines.forEach(line=>section.append(lineNode(line,false)));
    });
    complete(state);
  }
  async function run(signal) {
    try {
      await wait(speed.initial,signal);
      for (const stage of identityStages) {
        await wait(speed.stage,signal);
        setState('typing');
        const {section,command,text}=commandNode(stage);
        const cursor=make('span','identity-command-cursor','▏');
        command.append(cursor);
        for (const char of stage.command) {
          text.textContent+=char;followOutput();
          await wait(speed.typing,signal);
        }
        setState('executing');
        await wait(speed.execution,signal);
        cursor.remove();setState('revealing');
        for (const line of stage.lines) {
          section.append(lineNode(line,true));followOutput();
          const duration=line.type==='manifesto'?speed.manifesto
            : line.type==='heading'?speed.heading
            : line.type==='success'?speed.success:speed.line;
          await wait(duration,signal);
        }
        await wait(stage.pauseAfter,signal);
      }
      complete('completed');
    } catch (error) {
      if (!signal.aborted) console.error('Identity sequence:',error);
    }
  }
  function start() {
    if (destroyed) return;
    cancelSession();cancelScroll();
    transcript.replaceChildren();output.scrollTop=0;follow=true;
    announcement.textContent='';controls.hidden=true;enter.hidden=true;setState('idle');
    if (reducedMotion.matches) {showAll('completed');follow=false;output.scrollTop=0;return;}
    session=new AbortController();
    run(session.signal);
  }
  form.onsubmit=event=>{
    event.preventDefault();
    const command=input.value.trim().toLowerCase();
    if (!command) return;
    if (['1','todo','tasks'].includes(command)) {navigate('todo');return;}
    if (['2','map','portfolio'].includes(command)) {navigate('map');return;}
    if (command==='clear') {
      cancelSession();cancelScroll();transcript.replaceChildren();complete('skipped');
      input.value='';syncValue();return;
    }
    if (!['completed','skipped'].includes(shell.dataset.state)) showAll();
    const aliases={whoami:'identity',profile:'profile',focus:'focus',experience:'career',expertise:'expertise',recognition:'recognition',principles:'manifesto'};
    const stage=identityStages.find(item=>item.command===command||item.id===aliases[command]);
    const result=commandNode({id:'query',command});
    result.text.textContent=command;
    if (stage) stage.lines.forEach(line=>result.section.append(lineNode(line,false)));
    else result.section.append(make('p','identity-output-line',command==='about'
      ? 'Always Becoming. A design leader who finds clarity in complexity, builds scalable systems, and helps people grow.'
      : command==='help'
      ? 'Commands: whoami, about, profile, focus, experience, expertise, recognition, principles, clear. Type 1 for roadmap or 2 for portfolio.'
      : `Unknown command: ${command}. Type help for available commands.`));
    input.value='';syncValue();follow=true;followOutput();
  };
  const motionChange = () => {if(reducedMotion.matches)showAll('completed');};
  reducedMotion.addEventListener('change',motionChange);
  start();
  return {destroy(){
    destroyed=true;cancelSession();cancelScroll();resize.disconnect();observers.abort();
    reducedMotion.removeEventListener('change',motionChange);shell.remove();
  }};
}
