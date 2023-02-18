let path = window.location.origin;
if (path.charAt (path.length - 1) === '/') path = path.substring (0, path.length - 1);
export default path;