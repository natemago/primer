def('risc.core.error', ['libDraw'],function(libDraw){
    var BaseError = function(message, cause){
        libDraw.ext(this, new Error(message));
        this.stack = this.stack || 'Stack unavailable';
        this.cause = cause;
        this.message = message;
        if(cause){
            this.stack += '\nCaused by:\n' + (cause.stack || '[N/A]');
        }
    };
    
    libDraw.ext(BaseError, Error);
    
    return {
        BaseError: BaseError
    };
});
