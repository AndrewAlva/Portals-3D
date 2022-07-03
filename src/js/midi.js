export class MIDI {
    constructor() {
        this.setupEvents();
    }

    init(callback) {
        let promise = new Promise( (resolve, reject) => {
            const AkaiLPD8 = require('akai-lpd8');
    
            const LPD8 = new AkaiLPD8();
    
            LPD8.init()
                .then(() => {
                    // Example
                    // console.log(LPD8)

                    // Hook up firing handlers
                    LPD8.PAD1.change(_ => { midiEvents.dispatchEvent('P1_change', LPD8.PAD1) });
                    LPD8.PAD1.noteOn(_ => { midiEvents.dispatchEvent('P1_push', LPD8.PAD1) });
                    LPD8.PAD1.noteOff(_ => { midiEvents.dispatchEvent('P1_release', LPD8.PAD1) });
    
                    LPD8.PAD2.change(_ => { midiEvents.dispatchEvent('P2_change', LPD8.PAD2) });
                    LPD8.PAD2.noteOn(_ => { midiEvents.dispatchEvent('P2_push', LPD8.PAD2) });
                    LPD8.PAD2.noteOff(_ => { midiEvents.dispatchEvent('P2_release', LPD8.PAD2) });
    
                    LPD8.PAD3.change(_ => { midiEvents.dispatchEvent('P3_change', LPD8.PAD3) });
                    LPD8.PAD3.noteOn(_ => { midiEvents.dispatchEvent('P3_push', LPD8.PAD3) });
                    LPD8.PAD3.noteOff(_ => { midiEvents.dispatchEvent('P3_release', LPD8.PAD3) });
    
                    LPD8.PAD4.change(_ => { midiEvents.dispatchEvent('P4_change', LPD8.PAD4) });
                    LPD8.PAD4.noteOn(_ => { midiEvents.dispatchEvent('P4_push', LPD8.PAD4) });
                    LPD8.PAD4.noteOff(_ => { midiEvents.dispatchEvent('P4_release', LPD8.PAD4) });
    
                    LPD8.PAD5.change(_ => { midiEvents.dispatchEvent('P5_change', LPD8.PAD5) });
                    LPD8.PAD5.noteOn(_ => { midiEvents.dispatchEvent('P5_push', LPD8.PAD5) });
                    LPD8.PAD5.noteOff(_ => { midiEvents.dispatchEvent('P5_release', LPD8.PAD5) });
    
                    LPD8.PAD6.change(_ => { midiEvents.dispatchEvent('P6_change', LPD8.PAD6) });
                    LPD8.PAD6.noteOn(_ => { midiEvents.dispatchEvent('P6_push', LPD8.PAD6) });
                    LPD8.PAD6.noteOff(_ => { midiEvents.dispatchEvent('P6_release', LPD8.PAD6) });
    
                    LPD8.PAD7.change(_ => { midiEvents.dispatchEvent('P7_change', LPD8.PAD7) });
                    LPD8.PAD7.noteOn(_ => { midiEvents.dispatchEvent('P7_push', LPD8.PAD7) });
                    LPD8.PAD7.noteOff(_ => { midiEvents.dispatchEvent('P7_release', LPD8.PAD7) });
    
                    LPD8.PAD8.change(_ => { midiEvents.dispatchEvent('P8_change', LPD8.PAD8) });
                    LPD8.PAD8.noteOn(_ => { midiEvents.dispatchEvent('P8_push', LPD8.PAD8) });
                    LPD8.PAD8.noteOff(_ => { midiEvents.dispatchEvent('P8_release', LPD8.PAD8) });
    
    
                    LPD8.K1.change(_ => { midiEvents.dispatchEvent('K1_change', LPD8.K1) });
                    LPD8.K2.change(_ => { midiEvents.dispatchEvent('K2_change', LPD8.K2) });
                    LPD8.K3.change(_ => { midiEvents.dispatchEvent('K3_change', LPD8.K3) });
                    LPD8.K4.change(_ => { midiEvents.dispatchEvent('K4_change', LPD8.K4) });
                    LPD8.K5.change(_ => { midiEvents.dispatchEvent('K5_change', LPD8.K5) });
                    LPD8.K6.change(_ => { midiEvents.dispatchEvent('K6_change', LPD8.K6) });
                    LPD8.K7.change(_ => { midiEvents.dispatchEvent('K7_change', LPD8.K7) });
                    LPD8.K8.change(_ => { midiEvents.dispatchEvent('K8_change', LPD8.K8) });
    
    
                    // // Test event subscription
                    // addTestListeners();
    
                    // callback(); // Disable when no MIDI available
    
                })
                .catch(error => {
                    console.error({ error });
                    reject(new Error('midi could not initialize'));
                })
                .finally(_ => {
                    callback && callback();
                    resolve('midi initialized');
                });
        });

        return promise;
    }



    setupEvents() {
        // Set event handlers
        if (window.midiEvents) return;

        window.midiEvents = new Reactor();
        midiEvents.registerEvent('P1_change');
        midiEvents.registerEvent('P1_push');
        midiEvents.registerEvent('P1_release');

        midiEvents.registerEvent('P2_change');
        midiEvents.registerEvent('P2_push');
        midiEvents.registerEvent('P2_release');

        midiEvents.registerEvent('P3_change');
        midiEvents.registerEvent('P3_push');
        midiEvents.registerEvent('P3_release');

        midiEvents.registerEvent('P4_change');
        midiEvents.registerEvent('P4_push');
        midiEvents.registerEvent('P4_release');

        midiEvents.registerEvent('P5_change');
        midiEvents.registerEvent('P5_push');
        midiEvents.registerEvent('P5_release');

        midiEvents.registerEvent('P6_change');
        midiEvents.registerEvent('P6_push');
        midiEvents.registerEvent('P6_release');

        midiEvents.registerEvent('P7_change');
        midiEvents.registerEvent('P7_push');
        midiEvents.registerEvent('P7_release');

        midiEvents.registerEvent('P8_change');
        midiEvents.registerEvent('P8_push');
        midiEvents.registerEvent('P8_release');


        midiEvents.registerEvent('K1_change');
        midiEvents.registerEvent('K2_change');
        midiEvents.registerEvent('K3_change');
        midiEvents.registerEvent('K4_change');
        midiEvents.registerEvent('K5_change');
        midiEvents.registerEvent('K6_change');
        midiEvents.registerEvent('K7_change');
        midiEvents.registerEvent('K8_change');
    }

    handlePadChange(e) {
        console.log('handlePadChange', e.name, e.velocity);
    }
    handlePadPush(e) {
        console.log('handlePadPush', e.name, e.velocity);
    }
    handlePadRelease(e) {
        console.log('handlePadRelease', e.name, e.velocity);
    }

    handleKnobChange(e) {
        console.log('handleKnobChange', e.name, e.velocity);
    }


    addTestListeners() {
        midiEvents.addEventListener('P1_change', handlePadChange);
        midiEvents.addEventListener('P2_change', handlePadChange);
        midiEvents.addEventListener('P3_change', handlePadChange);
        midiEvents.addEventListener('P4_change', handlePadChange);
        midiEvents.addEventListener('P5_change', handlePadChange);
        midiEvents.addEventListener('P6_change', handlePadChange);
        midiEvents.addEventListener('P7_change', handlePadChange);
        midiEvents.addEventListener('P8_change', handlePadChange);
        
        midiEvents.addEventListener('P1_push', handlePadPush);
        midiEvents.addEventListener('P2_push', handlePadPush);
        midiEvents.addEventListener('P3_push', handlePadPush);
        midiEvents.addEventListener('P4_push', handlePadPush);
        midiEvents.addEventListener('P5_push', handlePadPush);
        midiEvents.addEventListener('P6_push', handlePadPush);
        midiEvents.addEventListener('P7_push', handlePadPush);
        midiEvents.addEventListener('P8_push', handlePadPush);
        
        midiEvents.addEventListener('P1_release', handlePadRelease);
        midiEvents.addEventListener('P2_release', handlePadRelease);
        midiEvents.addEventListener('P3_release', handlePadRelease);
        midiEvents.addEventListener('P4_release', handlePadRelease);
        midiEvents.addEventListener('P5_release', handlePadRelease);
        midiEvents.addEventListener('P6_release', handlePadRelease);
        midiEvents.addEventListener('P7_release', handlePadRelease);
        midiEvents.addEventListener('P8_release', handlePadRelease);

        midiEvents.addEventListener('K1_change', handleKnobChange);
        midiEvents.addEventListener('K2_change', handleKnobChange);
        midiEvents.addEventListener('K3_change', handleKnobChange);
        midiEvents.addEventListener('K4_change', handleKnobChange);
        midiEvents.addEventListener('K5_change', handleKnobChange);
        midiEvents.addEventListener('K6_change', handleKnobChange);
        midiEvents.addEventListener('K7_change', handleKnobChange);
        midiEvents.addEventListener('K8_change', handleKnobChange);
    }
}