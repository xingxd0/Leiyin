// One source of truth for navigation, routes, labels, and page modules.
const siteConfig = {
  views: {
    identity: {title:'IDentity',subtitle:'IDT / Identity',description:'Xudong Xing / Product Design Leader',route:'/idt'},
    todo: {title:'Todolist',subtitle:'TDL / Always Becoming',description:'A work in progress, by design.',route:'/tdl'},
    todoLab: {title:'Todolist Lab',subtitle:'JOURNAL / Always Becoming',description:'A journal of craft, people, and new possibilities.',route:'/tdl-lab'},
    map: {title:'Map',subtitle:'MAP / Work & Experiments',description:'A connected space for ideas and experiments.',route:'/map'},
    playground: {title:'Playground',subtitle:'PGD / Leave a note',description:'A shared space to leave, move, and discover notes.',route:'/pgd'}
  },
  images: {identity:null,todo:null,todoLab:null,map:null,playground:null},
  modules: {
    todo: './growth-roadmap-view.js?v=20261029-english',
    todoLab: './modules/todolist-journal.js?v=20261029-no-search-row',
    map: './modules/map.js?v=20261028-zoom',
    playground: './modules/playground.js?v=20261028-zoom'
  }
};
