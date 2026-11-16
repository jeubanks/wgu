import pytest

import lesson6


@pytest.mark.parametrize('check', lesson6.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 6: Graphs."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
