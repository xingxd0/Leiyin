// Shared tab metadata. Keys match existing DOM ids and terminal commands.
const siteConfig = {
  views: {
    identity: {title:'身份认证',subtitle:'CLI / Identity',description:'Xudong Xing / Product Design Leader',route:'/identity'},
    todo: {title:'todolist',subtitle:'Always Becoming',description:'A work in progress, by design.',route:'/todol'},
    model: {title:'能力模型',subtitle:'Capabilities / Work',description:'能力、方法与作品。',route:'/capabilities'},
    pending: {title:'待定',subtitle:'Undefined',description:'',route:'/pending'}
  },
  aliases: {'/roadmap':'todo'},
  images: {identity:null,todo:null,model:null,pending:null},
  modules: {
    todo: './growth-roadmap-view.js?v=20261027-modules',
    model: './modules/capabilities.js',
    pending: './modules/pending.js'
  }
};
