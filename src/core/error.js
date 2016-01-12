def('risc.core.error', ['oop'],function(oop){
    var BaseError = function(message, cause){
        oop.ext(this, new Error(message));
        //this.stack = this.stack || '[N/A]';
        this.cause = cause;
        this.message = message;
        //if(cause){
        //   this.stack += '\nCaused by:\n' + (cause.stack || '[N/A]');
        //}
    };

    oop.ext(BaseError, Error);
    oop.ext(BaseError, {
        fullStackTrace: function(){
            if(this.cause){
                if(this.cause.fullStackTrace){
                    return (this.stack || '') + '\nCaused by:\n' + (this.cause.fullStackTrace() || '[N/A]');
                }else{
                    return (this.stack || '') + '\nCaused by:\n' + (this.cause.stack || '[N/A]');
                }
            }
            return this.stack;
        }
    });

    return {
        BaseError: BaseError
    };
});
