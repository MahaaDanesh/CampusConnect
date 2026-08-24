import React from 'react';
import { initials } from '../utils/format.js';

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' };

const Avatar = ({ name, color = '#4638d6', size = 'md', className = '' }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white ${sizes[size]} ${className}`}
    style={{ backgroundColor: color }}
  >
    {initials(name) || '?'}
  </div>
);

export default Avatar;
