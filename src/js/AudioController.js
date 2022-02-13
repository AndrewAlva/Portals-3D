export class AudioController {
    constructor() {}

    async init(config = {}) {
        var _this = this;

        if (config.stream) {
            try {
                _this.stream = await window.navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
            } catch (err) {
                console.error(err);
            }
        }

        _this.setupHelpers();

        _this.context = new AudioContext();
        _this.state = {
            playing: false,
        };

        if (_this.stream) {
            _this.setupMicInput();
        } else {
            _this.setupAudioFile();
        }


        _this.setupAnalyser();

        _this.addHandlers();
    }

    setupHelpers() {
        var _this = this;

        // Convert the frequency in Hz to an index in the array
        _this.frequencyToIndex = function (frequencyHz, sampleRate, frequencyBinCount) {
            const nyquist = sampleRate / 2;
            const index = Math.round((frequencyHz / nyquist) * frequencyBinCount);
            return Math.min(frequencyBinCount, Math.max(0, index));
        }
        
        // Convert an index in a array to a frequency in Hz
        _this.indexToFrequency = function (index, sampleRate, frequencyBinCount) {
            return (index * sampleRate) / (frequencyBinCount * 2);
        }
        
        // Get the normalized audio signal (0..1) between two frequencies
        _this.audioSignal = function (analyser, frequencies, minHz, maxHz) {
            if (!analyser) return 0;
            const sampleRate = analyser.context.sampleRate;
            const binCount = analyser.frequencyBinCount;
            let start = _this.frequencyToIndex(minHz, sampleRate, binCount);
            const end = _this.frequencyToIndex(maxHz, sampleRate, binCount);
            const count = end - start;
            let sum = 0;
            for (; start < end; start++) {
            sum += frequencies[start];
            }
        
            const minDb = _this.analyserNode.minDecibels;
            const maxDb = _this.analyserNode.maxDecibels;
            const valueDb = count === 0 || !isFinite(sum) ? minDb : sum / count;
            return Math.map(valueDb, minDb, maxDb, 0, 1, true);
        }
    }

    setupAudioFile() {
        var _this = this;

        _this.audio = document.createElement('audio');

        // _this.audio.src = 'music/triste.mp3';
        // _this.audio.src = 'music/beer.mp3';
        // _this.audio.src = 'music/Just-Hold-On.mp3';
        // _this.audio.src = 'music/checkmate.mp3';
        _this.audio.src = 'music/peligro.mp3';
        // _this.audio.src = 'music/turbulencia.mp3';

        _this.audio.crossOrigin = "Anonymous"; // To play audio through an external page (e.g. using CDN)
        _this.audio.loop = true;
        _this.audio.controls = true;
        document.body.appendChild(_this.audio);

        _this.source = _this.context.createMediaElementSource(_this.audio);
    }

    setupMicInput() {
        var _this = this;
        _this.source = _this.context.createMediaStreamSource(_this.stream);
        _this.state.playing = true;
    }

    setupAnalyser() {
        var _this = this;

        _this.analyserNode = _this.context.createAnalyser();

        // Get some higher resolution toward the low end
        _this.analyserNode.fftSize = 2048 * 2;

        // Defaults goes from -100 to -30 dB,
        // but different tracks might need different values
        // _this.analyserNode.minDecibels = -100;
        // _this.analyserNode.maxDecibels = -30;
        _this.analyserNode.minDecibels = -100;
        _this.analyserNode.maxDecibels = -30;

        _this.frequencyData = new Float32Array(_this.analyserNode.fftSize);

        _this.source.connect(_this.analyserNode);
        if (!_this.stream) _this.source.connect(_this.context.destination);
    }

    async addHandlers() {
        var _this = this;
        window.ACEvents = new Reactor();
        ACEvents.registerEvent('AC_play');
        ACEvents.registerEvent('AC_pause');

        // Ensure we are in a resumed state
        await _this.context.resume();

        // window.addEventListener('click', _this.customTogglePlay.bind(_this));

        if (!_this.stream) {
            _this.audio.addEventListener('play', _this.handlePlay.bind(_this));
            _this.audio.addEventListener('pause', _this.handlePause.bind(_this));
        }
    }

    handlePlay(e) {
        var _this = this;
        _this.state.playing = true;
        ACEvents.dispatchEvent('AC_play');
    }
    
    handlePause(e) {
        var _this = this;
        _this.state.playing = false;
        ACEvents.dispatchEvent('AC_pause');
    }
    
    customTogglePlay(e) {
        var _this = this;
        if (_this.state.playing) {
            _this.state.playing = false;
            _this.audio.pause();
            ACEvents.dispatchEvent('AC_pause');
        } else {
            _this.state.playing = true;
            _this.audio.play();
            ACEvents.dispatchEvent('AC_play');
        }
    }
}