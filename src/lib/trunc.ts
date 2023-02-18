export default (str: string, count=27):string => {
    if (str.length <= count) return str;
    return str.substring (0, count - 3) + '...';
}