import * as React from 'react';
import { useState } from 'react';
import { Mask } from './types';

interface MaskSettingsProps {
  updateMasksHandler: (masks: Mask[]) => void;
  masks: Mask[];
}

const MaskSettings = ({ updateMasksHandler, masks }: MaskSettingsProps) => {
  const [newMask, setNewMask] = useState('');
  return (
    <div className='mask-settings'>
        <div className='mask-list'>
          { masks.map(
            (m, i) => 
            <span className='mask'>
              <span className='mask-value'>{m}</span>
              <span 
                title='Delete mask'
                className='mask-delete'
                onClick={() => {
                  const masksCopy = masks.slice();
                  masksCopy.splice(i, 1); // delete this element 
                  updateMasksHandler(masksCopy);
                }}>
                  ☒
                </span>
              </span>
          )}
      </div>
      <form 
        className='mask-settings-form'
        onSubmit={(e) => {
          e.preventDefault();
          if (newMask.length && !masks.includes(newMask)) updateMasksHandler([newMask, ...masks]);
          setNewMask('');
        }}
      >
        <input 
          className='mask-input' 
          placeholder='Enter a new mask here'
          value={newMask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.value.length) {
              setNewMask(e.currentTarget.value);
            }
          }} />
          <button type='submit'>Add Mask</button>
        </form>
      </div>
    );
}

export default MaskSettings ;
