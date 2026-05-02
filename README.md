#  A cyber cemetery where everything finds its digital eternity. 

## 1 Router

* home
  `/`

* single grave
  `api/:blockid/:graveid`
  `api/sea-1/grave-1`

* a grave block

  `api/:blockid`

  `api/sea-1`

## 2 API

- get grave

```js
get(`/grave/${graveid}`)
//这个graveid是指graveID而不是_id （为了路由好看）
// `/grave/grave-1`
```
- get grave list (get a block of graves)
```js
api.get('/grave', { params: { limit: 100, block:blockid } })
```
- get block list
```js
api.get('/blocks')
```
