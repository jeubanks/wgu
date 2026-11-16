import pathlib
import sys

HERE = pathlib.Path(__file__).parent


def pytest_addoption(parser):
    parser.addoption('--solutions', action='store_true',
                     help='test the answer key in solutions/ instead of your files')


def pytest_configure(config):
    folder = HERE / 'solutions' if config.getoption('--solutions') else HERE
    sys.path.insert(0, str(folder))
