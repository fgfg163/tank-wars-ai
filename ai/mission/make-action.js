export default type => {
  if (typeof(type) === 'string') {
    return {
      type,
    };
  }
  return type;
}
