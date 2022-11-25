module.exports.list = [];

module.exports.pull = () => {
    return this.list;
}

module.exports.push = (interval) => {
    this.list.push(interval);
}

module.exports.clear = () => {
    this.list = [];
}