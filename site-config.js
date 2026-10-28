// Shared tab metadata. Keys match existing DOM ids and terminal commands.
const siteConfig = {
  views: {
    identity: {title:'身份认证',subtitle:'CLI / Identity',description:'Xudong Xing / Product Design Leader',route:'/identity'},
    todo: {title:'todolist',subtitle:'Always Becoming',description:'A work in progress, by design.',route:'/todol'},
    model: {title:'Workshop',subtitle:'Work & Experiments',description:'A space to make, test, and play.',route:'/capabilities'},
    pending: {title:'Guestbook',subtitle:'Leave a note',description:'A small space for thoughts, questions, and hellos.',route:'/guestbook'}
  },
  aliases: {'/roadmap':'todo','/pending':'pending'},
  images: {identity:null,todo:null,model:null,pending:null},
  modules: {
    todo: './growth-roadmap-view.js?v=20261028-input',
    model: './modules/capabilities.js?v=20261028-region-copy',
    pending: './modules/guestbook.js?v=20261028-guestbook'
  }
};
