import { useEffect } from 'react';
/**
 * Hook to listen for voice commands and run the provided callback
 * @param {Function} cmd - Function to call when a valid voice command is detected
 */
export default function useVcmd(cmd) {
  useEffect(() => {
    // making window recoginition 
    const tell = window.SpeechRecognition || window.webkitSpeechRecognition;
    const reconz= new tell();

    reconz.continuous = true;
    reconz.interimResults = false;
    //  making some operations 
    reconz.onresult = (event) => {
      const lres = event.results[event.results.length - 1];
      const spTxt = lres[0].transcript.toLowerCase().trim();
      console.log(spTxt);
      // making a simple logic 
      if (
        spTxt.includes('accept') ||
        
        spTxt.includes('reject') ||
        spTxt.includes('edit')
      ) {
        
        cmd(spTxt);
      }
    };

    reconz.start();

    return () => {
      reconz.stop();
    };
  }, [cmd]);
}
