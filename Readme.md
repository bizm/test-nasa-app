https://advancedweb.hu/how-to-use-api-gateway-with-cloudfront/
https://medium.com/swlh/how-to-expose-aws-http-api-gateway-via-aws-cloudfront-16383f45704b
https://serebrov.github.io/html/2019-06-16-multi-origin-cloudfront-setup.html
https://advancedweb.hu/how-to-route-to-multiple-origins-with-cloudfront/

```
 docker run -it --name node-tool -v $(pwd | sed 's/^\/mng//'):/workspace node:latest bash
```

```
function doCall() {
  const r = new XMLHttpRequest();
  r.addEventListener("load", () => { console.log(this.responseText); });
  r.open("GET", "api/gimme");
  r.send();
}
doCall();
```
