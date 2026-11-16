import pytest

import lesson3


@pytest.mark.parametrize('check', lesson3.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 3: Hash tables."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
