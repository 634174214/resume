/**
 * 从数组中随机抽取指定数量的不重复元素，优先保证 musthave: true 的项
 * @param {Array} arr - 要处理的原始数组
 * @param {number} count - 需要返回的元素个数
 * @returns {Array} 包含不重复随机元素的新数组
 */
function getRandomItemsWithMusthave(arr, count) {
    // 参数校验：确保第一个参数是数组
    if (!Array.isArray(arr)) {
        throw new TypeError('第一个参数必须是数组');
    }
    
    // 参数校验：确保第二个参数是正整数
    if (!Number.isInteger(count) || count < 0) {
        throw new TypeError('第二个参数必须是非负整数');
    }
    
    // 如果数组为空或count为0，直接返回空数组
    if (arr.length === 0 || count === 0) {
        return [];
    }
    
    // 分离 musthave 项和非 musthave 项
    const musthaveItems = arr.filter(item => item.musthave === true);
    const normalItems = arr.filter(item => item.musthave !== true);
    
    // 如果 musthave 项的数量大于等于需要的数量
    if (musthaveItems.length >= count) {
        // 从 musthave 项中随机抽取 count 个
        return shuffleArray([...musthaveItems]).slice(0, count);
    }
    
    // 否则，先取所有 musthave 项
    const result = [...musthaveItems];
    
    // 计算还需要从普通项中抽取的数量
    const needCount = count - musthaveItems.length;
    
    // 如果普通项数量不足，则取全部普通项（并乱序）
    if (normalItems.length <= needCount) {
        result.push(...shuffleArray([...normalItems]));
        return result;
    }
    
    // 从普通项中随机抽取 needCount 个
    const shuffledNormal = shuffleArray([...normalItems]);
    result.push(...shuffledNormal.slice(0, needCount));
    
    return result;
}


/**
 * 从数组中随机抽取指定数量的不重复元素
 * @param {Array} arr - 要处理的原始数组
 * @param {number} count - 需要返回的元素个数
 * @returns {Array} 包含不重复随机元素的新数组
 */
function getRandomItems(arr, count) {
    // 参数校验：确保第一个参数是数组
    if (!Array.isArray(arr)) {
        throw new TypeError('第一个参数必须是数组');
    }
    
    // 参数校验：确保第二个参数是正整数
    if (!Number.isInteger(count) || count < 0) {
        throw new TypeError('第二个参数必须是非负整数');
    }
    
    // 如果数组为空或count为0，直接返回空数组
    if (arr.length === 0 || count === 0) {
        return [];
    }
    
    // 如果需要的数量大于数组长度，则返回整个数组的随机乱序副本
    if (count >= arr.length) {
        return shuffleArray([...arr]);
    }
    
    // 使用Fisher-Yates洗牌算法对数组副本进行乱序
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // 返回前count个元素
    return shuffled.slice(0, count);
}

/**
 * 辅助函数：对数组进行完全乱序（Fisher-Yates算法）
 * @param {Array} arr - 需要乱序的数组
 * @returns {Array} 乱序后的新数组
 */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 传入最小 最大 步长 返回纯数字数组
function rangeStep(min,max,step){
    var res = [];
    for(var i = min; i <= max; i += step){
        res.push(i);
    }
    return res;
}