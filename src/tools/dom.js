(function(){
  var domSelector = function(){
    return jQuery;
  };
  def('dom.selector', domSelector);

  // aliases
  def(':$', domSelector);
  def('$', domSelector);
  def(':element', domSelector);
})();
