import createElement from './vdom/createElement';
const vApp = createElement('div', {
  attrs: {
    id: 'app',
  },
});

console.log(vApp);