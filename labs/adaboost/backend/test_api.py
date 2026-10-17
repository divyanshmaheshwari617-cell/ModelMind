from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    assert client.get('/api/health').json()['status'] == 'ok'

def test_datasets():
    assert len(client.get('/api/datasets').json()['datasets']) == 4

def test_classification_training():
    d = client.get('/api/datasets/moons').json()
    p = {'rows':d['rows'], 'features':d['features'],'target':'target','task':'classification','n_estimators':8}
    result=client.post('/api/train',json=p)
    assert result.status_code==200, result.text
    j=result.json()
    assert len(j['stages'])>0 and 'accuracy' in j['metrics']['test']
    assert j['surface'] is not None

def test_regression_training():
    d=client.get('/api/datasets/nonlinear-regression').json()
    result=client.post('/api/train',json={'rows':d['rows'],'features':d['features'],'target':'target','task':'regression','n_estimators':10})
    assert result.status_code==200, result.text
    j=result.json()
    assert 'r2' in j['metrics']['test'] and j['surface'] is not None

def test_mixed_missing():
    d=client.get('/api/datasets/complex-classification').json()
    result=client.post('/api/train',json={'rows':d['rows'],'features':d['features'],'target':'target','task':'classification','n_estimators':10})
    assert result.status_code==200,result.text
    assert result.json()['preprocessing']['missing_cells']>0

def test_target_leakage_block():
    d=client.get('/api/datasets/moons').json()
    result=client.post('/api/train',json={'rows':d['rows'],'features':['target'],'target':'target'})
    assert result.status_code==422

def test_multivariate_classification_surface_axes():
    d = client.get('/api/datasets/complex-classification').json()
    res = client.post('/api/train', json={
        'rows': d['rows'], 'features': d['features'], 'target': d['target'],
        'task': 'classification', 'n_estimators': 8,
        'plot_features': ['signal_2', 'signal_4'],
    })
    assert res.status_code == 200, res.text
    surf = res.json()['surface']
    assert surf is not None
    assert [surf['feature_x'], surf['feature_y']] == ['signal_2', 'signal_4']
    assert 'region' in surf['fixed_features']
    assert len(surf['z']) == 31


def test_multivariate_regression_surface_axes():
    d = client.get('/api/datasets/mixed-regression').json()
    res = client.post('/api/train', json={
        'rows': d['rows'], 'features': d['features'], 'target': d['target'],
        'task': 'regression', 'n_estimators': 8,
        'plot_features': ['factor_1', 'factor_3'],
    })
    assert res.status_code == 200, res.text
    surf = res.json()['surface']
    assert surf is not None
    assert surf['feature_y'] == 'factor_3'
    assert 'segment' in surf['fixed_features']


def test_bad_plot_axes_rejected():
    d = client.get('/api/datasets/complex-classification').json()
    res = client.post('/api/train', json={
        'rows': d['rows'], 'features': d['features'], 'target': d['target'],
        'plot_features': ['region', 'signal_2'], 'n_estimators': 5,
    })
    assert res.status_code == 422


def test_numeric_imputation_methods():
    d=client.get('/api/datasets/complex-classification').json()
    for method in ('mean','median','most_frequent','constant'):
        res=client.post('/api/train',json={'rows':d['rows'],'features':d['features'],'target':'target','task':'classification','n_estimators':5,'missing_strategy':method,'missing_fill_value':-1})
        assert res.status_code==200,(method,res.text)
        assert res.json()['preprocessing']['missing_strategy']==method


def test_drop_and_per_column_override():
    d=client.get('/api/datasets/complex-classification').json()
    res=client.post('/api/train',json={'rows':d['rows'],'features':d['features'],'target':'target','task':'classification','n_estimators':5,'feature_strategies':{'signal_2':'drop'}})
    assert res.status_code==200,res.text
    assert res.json()['preprocessing']['dropped_feature_rows']>0
    assert res.json()['preprocessing']['dropped_target_rows']==0


def test_categorical_constant_imputation():
    d=client.get('/api/datasets/complex-classification').json()
    for item in d['rows'][::11]: item['region']=None
    res=client.post('/api/train',json={'rows':d['rows'],'features':d['features'],'target':'target','task':'classification','n_estimators':5,'categorical_missing_strategy':'constant','categorical_fill_value':'Unknown'})
    assert res.status_code==200,res.text
    assert res.json()['preprocessing']['categorical_missing']['region']>0


def test_reject_categorical_mean_strategy():
    d=client.get('/api/datasets/complex-classification').json()
    res=client.post('/api/train',json={'rows':d['rows'],'features':d['features'],'target':'target','task':'classification','n_estimators':5,'feature_strategies':{'region':'mean'}})
    assert res.status_code==422
