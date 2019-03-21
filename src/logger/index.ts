import * as stackTrace from "stack-trace";
import * as path from "path";
import * as util from "util";
import * as fs from "fs";
import * as moment from "moment";
var projectname = require('../../package').name;

export class Logger {

    private filename; 
    private _module; 
    private streams = [];
    private trace; 
    
    public log; 
    public info; 
    public error; 
    public warn;

    public regCardLog;
    public regCardError;

    checkCardLog;
    checkCardError;

    constructor () {
        function generateLogFunction(level) 
        {
            return function(message,meta)
            {
                if (typeof message === 'object') message = JSON.stringify(message);

                var now = new Date();

                let mes = '-------------------------------------------------\n'
                mes += `[${moment(now).format('DD.MM.YYYY')} ${moment(now).format('HH:mm:ss')}] -- ` + level;
                mes += '\nModule: ' + this._module;
                mes += '\nMessage: ' + message; 
                if(meta) mes += "\nMeta: " + util.inspect(meta) + " "; 
                mes += '\n'; 

                let file_name = moment(now).format('DD-MM-YYYY') + '-' + level + '.log';

                const dir = path.resolve('./', 'logs');
                const file = path.resolve(dir, file_name);

                if (!fs.existsSync(dir)) fs.mkdirSync(dir);

                const file_stream = fs.createWriteStream(file, {flags: 'a', encoding: 'utf-8', mode: 0o666});

                this.streams = [process.stdout, file_stream]; 
                
                this.write(mes);
            }

        };

        let now = new Date();

        this.trace = stackTrace.get()[1];
        this.filename = this.trace.getFileName(); 
        this._module = projectname + path.sep + path.relative('.', this.filename); 

        this.log = generateLogFunction('Log'); 
        this.info = generateLogFunction('Info'); 
        this.error = generateLogFunction('Error'); 
        this.warn = generateLogFunction('Warning'); 
        this.checkCardLog = generateLogFunction('checkCardLog');
        this.checkCardError = generateLogFunction('checkCardError');
        this.regCardLog = generateLogFunction('RegCardLog');
        this.regCardError = generateLogFunction('RegCardError');
    }

    write(d) {
        this.streams.forEach((stream)=>{
            stream.write(d);
        });
    }
}