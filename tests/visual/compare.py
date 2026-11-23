# Compara dos carpetas de capturas y lista las que cambian (más de 40 píxeles distintos).
import sys,os
from PIL import Image,ImageChops
a,b=sys.argv[1],sys.argv[2];bad=[]
for f in sorted(os.listdir(a)):
    A=Image.open(os.path.join(a,f)).convert('RGB');B=Image.open(os.path.join(b,f)).convert('RGB')
    if A.size!=B.size:bad.append((f,'size'));continue
    d=ImageChops.difference(A,B).convert('L').point(lambda x:255 if x>24 else 0);n=sum(1 for _ in [0]) and d.histogram()[255]
    if n>40:bad.append((f,n))
print(len(bad),'distintas');[print(' ',x) for x in bad]
