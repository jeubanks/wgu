import pytest

import lesson7


@pytest.mark.parametrize('check', lesson7.CHECKS, ids=lambda c: c.__doc__)
def test_exercise(check):
    """Lesson 7: Tracing pseudocode."""
    try:
        check()
    except NotImplementedError:
        pytest.skip('not started')
