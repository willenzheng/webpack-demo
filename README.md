# Webpack 构建流程
### 第一步：初始化参数
解析 Webpack 配置参数，合并 Shell 传入和 webpack.config.js 文件配置的参数，形成最后的配置结果。
### 第二步：开始编译
上一步得到的参数初始化 compiler 对象，注册所有配置的插件，插件监听 Webpack 构建生命周期的事件节点，做出相应的反应，执行对象的 run 方法开始执行编译。
### 第三步：确定入口
从配置文件（ webpack.config.js ）中指定的 entry 入口，开始解析文件构建 AST 语法树，找出依赖，递归下去。
### 第四步：编译模块
递归中根据文件类型和 loader 配置，调用所有配置的 loader 对文件进行转换，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
### 第五步：完成模块编译并输出
递归完后，得到每个文件结果，包含每个模块以及他们之间的依赖关系，根据 entry 配置生成代码块 chunk 。
### 第六步：输出完成
输出所有的 chunk 到文件系统。
# 参考链接
- [王平安-一文精通 Webpack 构建流程](https://mp.weixin.qq.com/s/lWhGuD8eqXy7QCYvY5xYSg)