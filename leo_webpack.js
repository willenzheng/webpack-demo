const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
// 由于 traverse 采用的 ES Module 导出，我们通过 requier 引入的话就加个 .default
const babel = require("@babel/core");

let moduleId = 0;
const createAssets = filename => {

  // 根据文件名，同步读取文件流
  const content = fs.readFileSync(filename, "utf-8");

  // 将读取文件流 buffer 转换为 AST
  const ast = parser.parse(content, {

    // 指定源码类型
    sourceType: "module"
  })

  // 用于收集文件依赖的路径
  const dependencies = [];

  // 通过 traverse 提供的操作 AST 的方法，获取每个节点的依赖路径
  traverse(ast, {
    ImportDeclaration: ({node}) => {
      dependencies.push(node.source.value);
    }
  })

  const { code } = babel.transformFromAstSync(ast,null, {
    presets: ["@babel/preset-env"]
  });

  // 设置当前处理的模块ID
  let id = moduleId++; 
  return {
    id,
    filename,
    code,
    dependencies
  }
}

function createGraph(entry) {

  // 获取入口文件下的内容
  const mainAsset = createAssets(entry);

  // 入口文件的结果作为第一项
  const queue = [mainAsset];

  for(const asset of queue){
    const dirname = path.dirname(asset.filename);
    asset.mapping = {};
    asset.dependencies.forEach(relativePath => {

      // 转换文件路径为绝对路径
      const absolutePath = path.join(dirname, relativePath);
      const child = createAssets(absolutePath);

      // 保存模块ID
      asset.mapping[relativePath] = child.id;

      // 递归去遍历所有子节点的文件
      queue.push(child);
    })
  }
  return queue;
}

function bundle(graph) {
  let modules = "";
  graph.forEach(item => {
    modules += `
      ${item.id}: [
        function(require, module, exports) {
          ${item.code}
        },
        ${JSON.stringify(item.mapping)}
      ],
    `
  })
  return `
    (function(modules){
      function require(id){
        const [fn, mapping] = modules[id];
        function localRequire(relativePath){
          return require(mapping[relativePath]);
        }
        const module = {
          exports: {}
        }
        fn(localRequire, module, module.exports);
        return module.exports;
      }
      require(0);
    })({${modules}})
  `
}

const graph = createGraph("./src/index.js");
const result = bundle(graph);
// console.log(result);
eval(result);

