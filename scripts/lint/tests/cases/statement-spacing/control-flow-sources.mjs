export const controlFlowSources = [
  'function value(ready){const first=1;const second=2;if(ready)return first;else return second;}',
  'function value(ready){const values=[1,2];switch(ready){case true:{return values[0];}default:{return values[1];}}}',
  'function value(ready){let result=0;try{if(ready)result=1;else result=2;}catch(error){result=3;}finally{result+=0;}return result;}',
  'function value(ready){let result=0;for(let index=0;index<2;index++){if(ready){result=1;break;}result=2;continue;}return result;}',
];
