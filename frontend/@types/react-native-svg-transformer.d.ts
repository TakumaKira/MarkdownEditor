/**
 * react-native-svg-transformer with TypeScript needs this.
 * @see https://github.com/kristerkari/react-native-svg-transformer#using-typescript
 */

declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}