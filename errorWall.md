client:733 [vite] connecting...
client:827 [vite] connected.
api.js:3 API module loading...
api.js:500 API module loaded successfully
main.js:1 Starting main.js
main.js:3 Imported Vue
main.js:5 Imported Bootstrap CSS
main.js:7 Imported Bootstrap JS
main.js:9 Imported Popper.js
main.js:11 Imported Bootstrap Icons CSS
main.js:13 Imported style.css
main.js:15 Pinia imported
main.js:17 App imported
main.js:19 Attempting to import router
main.js:21 Router imported successfully
main.js:23 Creating app
main.js:25 App created
theme.js:27 Setting theme to: light
theme.js:44 data-bs-theme set to: light
theme.js:45 html classList: 
theme.js:27 Setting theme to: light
theme.js:44 data-bs-theme set to: light
theme.js:45 html classList: 
NavBar.vue:124 NavBar mounted, window width: 1361
NavBar.vue:125 Theme: light
theme.js:27 Setting theme to: light
theme.js:44 data-bs-theme set to: light
theme.js:45 html classList: 
main.js:33 App mounted
useFarmData.js:28 Error fetching companies: RangeError: Maximum call stack size exceeded
    at Reflect.get (<anonymous>)
    at MutableReactiveHandler.get (chunk-2MKFL3BX.js?v=b002fc07:1230:25)
    at getCached (useFarmData.js:7:35)
    at getCompanies (useFarmData.js:12:20)
    (repetición de llamadas: getCompanies llama a getCompanies infinitamente en línea 16)
    (stack repetido ~miles de veces, causando overflow)
NavBar.vue:133 Error fetching data: RangeError: Maximum call stack size exceeded
    at Reflect.get (<anonymous>)
    at MutableReactiveHandler.get (chunk-2MKFL3BX.js?v=b002fc07:1230:25)
    at getCached (useFarmData.js:7:35)
    at getCompanies (useFarmData.js:12:20)
    (mismo loop infinito)
(anonymous) @ NavBar.vue:133
await in (anonymous)
(anonymous) @ chunk-2MKFL3BX.js?v=b002fc07:5221
callWithErrorHandling @ chunk-2MKFL3BX.js?v=b002fc07:2342
callWithAsyncErrorHandling @ chunk-2MKFL3BX.js?v=b002fc07:2349
hook.__weh.hook.__weh @ chunk-2MKFL3BX.js?v=b002fc07:5201
flushPostFlushCbs @ chunk-2MKFL3BX.js?v=b002fc07:2527
render2 @ chunk-2MKFL3BX.js?v=b002fc07:8893
mount @ chunk-2MKFL3BX.js?v=b002fc07:6335
app.mount @ chunk-2MKFL3BX.js?v=b002fc07:12504
(anonymous) @ main.js:32
login:1 [DOM] Input elements should have autocomplete attributes (suggested: "current-password"): (More info: https://goo.gl/9p2vKq) <input type="password" required class="form-control form-control-lg rounded-pill mx-auto" placeholder="••••••••" style="width: 90%;" data-np-autofill-field-type="password" data-np-uid="eda623e3-ce62-4c91-a048-c83a3b9af26d">