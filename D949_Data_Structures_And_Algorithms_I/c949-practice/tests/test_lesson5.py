import pytest

import lesson5


@pytest.mark.parametrize('check', lesson5.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 5: Searching and sorting."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
