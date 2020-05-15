class Compile {
    constructor(el, vm) {
        this.el = this.isElmentNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        // 如过传入的根元素存在，才开始编译
        if (this.el) {
            // 1、把这些真实的 Dom 移动到内存中，即 fragment（文档碎片）
            let fragment = this.node2fragment(this.el);
            this.compile(fragment);
            this.el.appendChild(fragment);
        }
    }

    /* 辅助方法 */
    // 判断是否是元素节点
    isElmentNode(node) {
        return node.nodeType === 1;
    }

    // ********** 以下为新增代码 **********
    // 判断属性是否为指令
    isDirective(name) {
        return name.includes("v-");
    }
    // ********** 以上为新增代码 **********


    /* 核心方法 */
    // 将根节点转移至文档碎片
    node2fragment(el) {
        // 创建文档碎片
        let fragment = document.createDocumentFragment();
        // 第一个子节点
        let firstChild;

        // 循环取出根节点中的节点并放入文档碎片中
        // while (el.firstChild && (firstChild = el.removeChild(el.firstChild))) {
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }

    // ********** 以下为新增代码 **********
    // 解析文档碎片
    compile(fragment) {
        // 当前父节点节点的子节点，包含文本节点，类数组对象
        let childNodes = fragment.childNodes;
        // 转换成数组并循环判断每一个节点的类型
        Array.from(childNodes).forEach(node => {
            if (this.isElmentNode(node)) {// 是元素节点
                // 递归编译子节点
                this.compile(node);

                // 编译元素节点的方法
                this.compileElement(node);
            } else { // 是文本节点
                // 编译文本节点的方法
                this.compileText(node);
            }
        })
    }
    // 编译元素
    compileElement(node) {
        // 取出当前节点的属性，类数组
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            // 获取属性名，判断属性是否为指令，即含 v-
            let attrName = attr.name;

            if (this.isDirective(attrName)) {
                // 如果是指令，取到该属性值得变量在 data 中对应得值，替换到节点中
                let exp = attr.value

                // 取出方法名
                let [, type] = attrName.split("-")

                // 调用指令对应得方法
                CompileUtil[type](node, this.vm, exp,this.compile.bind(this));
            }

        })
    }

    // 编译文本
    compileText(node) {
        // 获取文本节点的内容
        let exp = node.textContent

        // 创建匹配 {{}} 的正则表达式  /\{\{(.+?)\}\}/g
        let reg = /\{\{([^}]+)\}\}/g;

        // 如果存在 {{}} 则使用 text 指令的方法
        if (reg.test(exp)) {
            CompileUtil["text"](node, this.vm, exp)
        }
    }

}
