import pytest

import lesson1


@pytest.mark.parametrize('check', lesson1.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 1: Big-O by experiment."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
