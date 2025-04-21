
/**
 * Công cụ giúp debug trong React Native
 */
export const DebugHelper = {
  /**
   * Log state khi nó thay đổi
   * @param {string} name - Tên của state
   * @param {any} value - Giá trị state
   * @param {boolean} verbose - Log chi tiết
   */
  logState(name, value, verbose = false) {
    if (verbose) {
      console.log(`State [${name}] changed:`, value);
      if (typeof value === 'object' && value !== null) {
        console.log(`Type: ${Array.isArray(value) ? 'Array' : 'Object'}, Keys: ${Object.keys(value)}`);
      } else {
        console.log(`Type: ${typeof value}, Truthy: ${!!value}`);
      }
    } else {
      console.log(`State [${name}]:`, value);
    }
  },
  
  /**
   * So sánh hai giá trị và log sự khác biệt
   * @param {string} name - Tên để hiển thị
   * @param {any} oldValue - Giá trị cũ
   * @param {any} newValue - Giá trị mới
   */
  compareDiff(name, oldValue, newValue) {
    console.log(`Comparing ${name}:`);
    console.log(`- Old:`, oldValue);
    console.log(`- New:`, newValue);
    
    if (typeof oldValue === 'object' && typeof newValue === 'object') {
      const allKeys = [...new Set([...Object.keys(oldValue), ...Object.keys(newValue)])];
      
      allKeys.forEach(key => {
        if (oldValue[key] !== newValue[key]) {
          console.log(`- Changed [${key}]:`, oldValue[key], '->', newValue[key]);
        }
      });
    }
  },
  
  /**
   * Tạo một đối tượng debug để theo dõi các hàm
   * @param {Object} obj - Object gốc
   * @param {string} name - Tên để hiển thị
   * @returns {Object} - Object với các hàm được wrap để log
   */
  createDebugProxy(obj, name = 'Object') {
    return new Proxy(obj, {
      get: function(target, prop) {
        const value = target[prop];
        if (typeof value === 'function') {
          return function(...args) {
            console.log(`Calling ${name}.${prop}(`, ...args, ')');
            const result = value.apply(target, args);
            if (result instanceof Promise) {
              return result.then(res => {
                console.log(`${name}.${prop} resolved:`, res);
                return res;
              }).catch(err => {
                console.error(`${name}.${prop} rejected:`, err);
                throw err;
              });
            }
            console.log(`${name}.${prop} returned:`, result);
            return result;
          };
        }
        return value;
      }
    });
  }
};
